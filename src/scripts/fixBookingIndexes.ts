import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Booking from '../models/booking.model';

async function fixBookingIndexes() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('✅ Connected to MongoDB');

    console.log('\n📋 Current indexes:');
    const indexes = await Booking.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the old unique indexes that don't have partial filter
    console.log('\n🗑️  Dropping old indexes...');
    
    try {
      await Booking.collection.dropIndex('razorpayOrderId_1');
      console.log('✅ Dropped razorpayOrderId_1');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('⚠️  razorpayOrderId_1 index does not exist');
      } else {
        console.log('❌ Error dropping razorpayOrderId_1:', error.message);
      }
    }

    // Recreate index with partial filter expression
    console.log('\n🔨 Creating new index with partial filter...');
    
    await Booking.collection.createIndex(
      { razorpayOrderId: 1 },
      {
        unique: true,
        partialFilterExpression: { razorpayOrderId: { $type: 'string' } },
        name: 'razorpayOrderId_1_partial'
      }
    );
    console.log('✅ Created razorpayOrderId_1_partial');

    console.log('\n📋 New indexes:');
    const newIndexes = await Booking.collection.getIndexes();
    console.log(JSON.stringify(newIndexes, null, 2));

    console.log('\n✅ Booking indexes fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing booking indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixBookingIndexes();


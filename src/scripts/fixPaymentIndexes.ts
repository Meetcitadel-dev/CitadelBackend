import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Payment from '../models/payment.model';

async function fixPaymentIndexes() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('✅ Connected to MongoDB');

    console.log('\n📋 Current indexes:');
    const indexes = await Payment.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the old unique indexes that don't have partial filter
    console.log('\n🗑️  Dropping old indexes...');
    
    try {
      await Payment.collection.dropIndex('razorpayOrderId_1');
      console.log('✅ Dropped razorpayOrderId_1');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('⚠️  razorpayOrderId_1 index does not exist');
      } else {
        console.log('❌ Error dropping razorpayOrderId_1:', error.message);
      }
    }

    try {
      await Payment.collection.dropIndex('razorpayPaymentId_1');
      console.log('✅ Dropped razorpayPaymentId_1');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('⚠️  razorpayPaymentId_1 index does not exist');
      } else {
        console.log('❌ Error dropping razorpayPaymentId_1:', error.message);
      }
    }

    try {
      await Payment.collection.dropIndex('phonepeOrderId_1');
      console.log('✅ Dropped phonepeOrderId_1');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('⚠️  phonepeOrderId_1 index does not exist');
      } else {
        console.log('❌ Error dropping phonepeOrderId_1:', error.message);
      }
    }

    try {
      await Payment.collection.dropIndex('phonepePaymentId_1');
      console.log('✅ Dropped phonepePaymentId_1');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('⚠️  phonepePaymentId_1 index does not exist');
      } else {
        console.log('❌ Error dropping phonepePaymentId_1:', error.message);
      }
    }

    // Recreate indexes with partial filter expression
    console.log('\n🔨 Creating new indexes with partial filter...');
    
    await Payment.collection.createIndex(
      { razorpayOrderId: 1 },
      {
        unique: true,
        partialFilterExpression: { razorpayOrderId: { $type: 'string' } },
        name: 'razorpayOrderId_1_partial'
      }
    );
    console.log('✅ Created razorpayOrderId_1_partial');

    await Payment.collection.createIndex(
      { razorpayPaymentId: 1 },
      {
        unique: true,
        partialFilterExpression: { razorpayPaymentId: { $type: 'string' } },
        name: 'razorpayPaymentId_1_partial'
      }
    );
    console.log('✅ Created razorpayPaymentId_1_partial');

    await Payment.collection.createIndex(
      { phonepeOrderId: 1 },
      {
        unique: true,
        partialFilterExpression: { phonepeOrderId: { $type: 'string' } },
        name: 'phonepeOrderId_1_partial'
      }
    );
    console.log('✅ Created phonepeOrderId_1_partial');

    await Payment.collection.createIndex(
      { phonepePaymentId: 1 },
      {
        unique: true,
        partialFilterExpression: { phonepePaymentId: { $type: 'string' } },
        name: 'phonepePaymentId_1_partial'
      }
    );
    console.log('✅ Created phonepePaymentId_1_partial');

    console.log('\n📋 New indexes:');
    const newIndexes = await Payment.collection.getIndexes();
    console.log(JSON.stringify(newIndexes, null, 2));

    console.log('\n✅ Payment indexes fixed successfully!');
    console.log('\n💡 You can now create cash payments without duplicate key errors.');
    
  } catch (error) {
    console.error('❌ Error fixing payment indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixPaymentIndexes();


import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import DinnerBooking from '../models/dinnerBooking.model';
import DinnerEvent from '../models/dinnerEvent.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citadel';

async function cleanupOrphanedBookings() {
  try {
    console.log('🧹 Cleaning up orphaned bookings...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all DinnerBookings
    const bookings = await DinnerBooking.find({});
    console.log(`📋 Total DinnerBookings: ${bookings.length}\n`);

    const orphanedBookings = [];
    const validBookings = [];

    // Check each booking
    for (const booking of bookings) {
      const event = await DinnerEvent.findById(booking.eventId);
      
      if (!event) {
        orphanedBookings.push(booking);
        console.log(`❌ Orphaned Booking: ${booking._id}`);
        console.log(`   Event ID: ${booking.eventId} (NOT FOUND)`);
        console.log(`   User ID: ${booking.userId}`);
        console.log(`   Created: ${booking.createdAt}`);
        console.log('');
      } else {
        validBookings.push(booking);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Valid bookings: ${validBookings.length}`);
    console.log(`   Orphaned bookings: ${orphanedBookings.length}\n`);

    if (orphanedBookings.length > 0) {
      console.log('🗑️  Deleting orphaned bookings...');
      
      const orphanedIds = orphanedBookings.map(b => b._id);
      const deleteResult = await DinnerBooking.deleteMany({ _id: { $in: orphanedIds } });
      
      console.log(`✅ Deleted ${deleteResult.deletedCount} orphaned bookings\n`);
    } else {
      console.log('✅ No orphaned bookings found!\n');
    }

    console.log('🎉 Cleanup complete!');
  } catch (error) {
    console.error('❌ Error cleaning up bookings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

cleanupOrphanedBookings();


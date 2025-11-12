"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const dinnerBooking_model_1 = __importDefault(require("../models/dinnerBooking.model"));
const dinnerEvent_model_1 = __importDefault(require("../models/dinnerEvent.model"));
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citadel';
async function cleanupOrphanedBookings() {
    try {
        console.log('🧹 Cleaning up orphaned bookings...\n');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        // Get all DinnerBookings
        const bookings = await dinnerBooking_model_1.default.find({});
        console.log(`📋 Total DinnerBookings: ${bookings.length}\n`);
        const orphanedBookings = [];
        const validBookings = [];
        // Check each booking
        for (const booking of bookings) {
            const event = await dinnerEvent_model_1.default.findById(booking.eventId);
            if (!event) {
                orphanedBookings.push(booking);
                console.log(`❌ Orphaned Booking: ${booking._id}`);
                console.log(`   Event ID: ${booking.eventId} (NOT FOUND)`);
                console.log(`   User ID: ${booking.userId}`);
                console.log(`   Created: ${booking.createdAt}`);
                console.log('');
            }
            else {
                validBookings.push(booking);
            }
        }
        console.log(`\n📊 Summary:`);
        console.log(`   Valid bookings: ${validBookings.length}`);
        console.log(`   Orphaned bookings: ${orphanedBookings.length}\n`);
        if (orphanedBookings.length > 0) {
            console.log('🗑️  Deleting orphaned bookings...');
            const orphanedIds = orphanedBookings.map(b => b._id);
            const deleteResult = await dinnerBooking_model_1.default.deleteMany({ _id: { $in: orphanedIds } });
            console.log(`✅ Deleted ${deleteResult.deletedCount} orphaned bookings\n`);
        }
        else {
            console.log('✅ No orphaned bookings found!\n');
        }
        console.log('🎉 Cleanup complete!');
    }
    catch (error) {
        console.error('❌ Error cleaning up bookings:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}
cleanupOrphanedBookings();

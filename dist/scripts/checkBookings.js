"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const dinnerBooking_model_1 = __importDefault(require("../models/dinnerBooking.model"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citadel';
async function checkBookings() {
    try {
        console.log('🔍 Checking bookings in database...\n');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        // Check DinnerBooking collection
        console.log('📋 DinnerBooking Collection:');
        console.log('='.repeat(50));
        const dinnerBookings = await dinnerBooking_model_1.default.find({}).sort({ createdAt: -1 }).limit(10);
        console.log(`Total DinnerBookings: ${dinnerBookings.length}\n`);
        if (dinnerBookings.length > 0) {
            dinnerBookings.forEach((booking, index) => {
                console.log(`${index + 1}. Booking ID: ${booking._id}`);
                console.log(`   User ID: ${booking.userId}`);
                console.log(`   Event ID: ${booking.eventId}`);
                console.log(`   Payment ID: ${booking.paymentId}`);
                console.log(`   Payment Status: ${booking.paymentStatus}`);
                console.log(`   Payment Gateway: ${booking.paymentGateway}`);
                console.log(`   Booking Status: ${booking.bookingStatus}`);
                console.log(`   Amount: ₹${booking.paymentAmount}`);
                console.log(`   Created: ${booking.createdAt}`);
                console.log('');
            });
        }
        else {
            console.log('   ❌ No DinnerBookings found!\n');
        }
        // Check Booking collection (old)
        console.log('\n📋 Booking Collection (Old):');
        console.log('='.repeat(50));
        const bookings = await booking_model_1.default.find({}).sort({ createdAt: -1 }).limit(10);
        console.log(`Total Bookings: ${bookings.length}\n`);
        if (bookings.length > 0) {
            bookings.forEach((booking, index) => {
                console.log(`${index + 1}. Booking ID: ${booking._id}`);
                console.log(`   User ID: ${booking.userId}`);
                console.log(`   Event ID: ${booking.eventId}`);
                console.log(`   Status: ${booking.status}`);
                console.log(`   Amount: ₹${booking.amount}`);
                console.log(`   Created: ${booking.createdAt}`);
                console.log('');
            });
        }
        else {
            console.log('   ℹ️  No old Bookings found\n');
        }
        console.log('\n✅ Check complete!');
    }
    catch (error) {
        console.error('❌ Error checking bookings:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}
checkBookings();

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
async function debugBookings() {
    try {
        console.log('🔍 Debugging booking and event relationship...\n');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        // Get all DinnerBookings
        const bookings = await dinnerBooking_model_1.default.find({}).sort({ createdAt: -1 });
        console.log(`📋 Total DinnerBookings: ${bookings.length}\n`);
        // Get all DinnerEvents
        const events = await dinnerEvent_model_1.default.find({});
        console.log(`📅 Total DinnerEvents: ${events.length}\n`);
        console.log('Event IDs in database:');
        console.log('='.repeat(60));
        events.forEach((event, index) => {
            console.log(`${index + 1}. Event ID: ${event._id}`);
            console.log(`   Date: ${event.eventDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            })}`);
            console.log(`   City: ${event.city}, Area: ${event.area}`);
            console.log(`   Status: ${event.status}`);
            console.log('');
        });
        console.log('\nBooking → Event Mapping:');
        console.log('='.repeat(60));
        for (const booking of bookings) {
            console.log(`\n📌 Booking ID: ${booking._id}`);
            console.log(`   User ID: ${booking.userId}`);
            console.log(`   Event ID: ${booking.eventId}`);
            console.log(`   Booking Status: ${booking.bookingStatus}`);
            console.log(`   Payment Status: ${booking.paymentStatus}`);
            console.log(`   Created: ${booking.createdAt}`);
            // Try to find the event
            const event = await dinnerEvent_model_1.default.findById(booking.eventId);
            if (event) {
                console.log(`   ✅ Event FOUND:`);
                console.log(`      Date: ${event.eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                })}`);
                console.log(`      Time: ${event.eventTime}`);
                console.log(`      Location: ${event.city}, ${event.area}`);
                console.log(`      Status: ${event.status}`);
                // Check if event is past or upcoming
                const now = new Date();
                const eventDateTime = new Date(event.eventDate);
                const isPast = eventDateTime < now;
                console.log(`      Is Past: ${isPast ? 'YES' : 'NO'}`);
            }
            else {
                console.log(`   ❌ Event NOT FOUND! (Event was deleted or ID mismatch)`);
            }
        }
        console.log('\n\n🎯 Summary:');
        console.log('='.repeat(60));
        const bookingsWithEvents = bookings.filter(async (b) => {
            const event = await dinnerEvent_model_1.default.findById(b.eventId);
            return event !== null;
        });
        console.log(`Total Bookings: ${bookings.length}`);
        console.log(`Total Events: ${events.length}`);
        console.log(`Bookings with valid events: Checking...`);
        // Count bookings with valid events
        let validCount = 0;
        let invalidCount = 0;
        for (const booking of bookings) {
            const event = await dinnerEvent_model_1.default.findById(booking.eventId);
            if (event) {
                validCount++;
            }
            else {
                invalidCount++;
            }
        }
        console.log(`✅ Valid bookings (event exists): ${validCount}`);
        console.log(`❌ Invalid bookings (event deleted): ${invalidCount}`);
        console.log('\n✅ Debug complete!');
    }
    catch (error) {
        console.error('❌ Error debugging bookings:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}
debugBookings();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dinnerEvent_model_1 = __importDefault(require("../models/dinnerEvent.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function checkEvents() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/citadel';
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        // Get all events
        const allEvents = await dinnerEvent_model_1.default.find({}).sort({ eventDate: 1 });
        console.log('\n📊 Total Events in Database:', allEvents.length);
        console.log('='.repeat(80));
        if (allEvents.length === 0) {
            console.log('❌ No events found in database!');
        }
        else {
            allEvents.forEach((event, index) => {
                console.log(`\n${index + 1}. Event ID: ${event._id}`);
                console.log(`   Date: ${event.eventDate.toISOString().split('T')[0]}`);
                console.log(`   Time: ${event.eventTime}`);
                console.log(`   City: ${event.city}`);
                console.log(`   Area: ${event.area}`);
                console.log(`   Venue: ${event.venue || 'Not set'}`);
                console.log(`   Max Attendees: ${event.maxAttendees}`);
                console.log(`   Current Attendees: ${event.currentAttendees}`);
                console.log(`   Booking Fee: ₹${event.bookingFee}`);
                console.log(`   Status: ${event.status}`);
                console.log(`   Created: ${event.createdAt}`);
            });
        }
        // Check upcoming events
        console.log('\n\n📅 Upcoming Events (status=upcoming, future dates):');
        console.log('='.repeat(80));
        const upcomingEvents = await dinnerEvent_model_1.default.find({
            status: 'upcoming',
            eventDate: { $gte: new Date() }
        }).sort({ eventDate: 1 });
        console.log(`Found ${upcomingEvents.length} upcoming events`);
        upcomingEvents.forEach((event, index) => {
            console.log(`\n${index + 1}. ${event.city} - ${event.area}`);
            console.log(`   Date: ${event.eventDate.toISOString().split('T')[0]} at ${event.eventTime}`);
            console.log(`   Seats: ${event.currentAttendees}/${event.maxAttendees}`);
        });
        await mongoose_1.default.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
checkEvents();

import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import DinnerEvent from '../models/dinnerEvent.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citadel';

async function updateFridayEvents() {
  try {
    console.log('🗑️  Clearing old events and creating new Friday events...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear ALL existing dinner events
    const deleteResult = await DinnerEvent.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing dinner events`);

    // Get next 3 Fridays
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 5 = Friday
    const daysUntilFriday = currentDay <= 5 ? (5 - currentDay) : (7 - currentDay + 5);

    const fridayEvents = [];

    // Create events for next 3 Fridays
    for (let i = 0; i < 3; i++) {
      const fridayDate = new Date(today);
      fridayDate.setDate(today.getDate() + daysUntilFriday + (i * 7)); // Add 7 days for each week
      fridayDate.setHours(20, 0, 0, 0); // 8:00 PM

      console.log(`📅 Friday ${i + 1}: ${fridayDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`);

      // Create one event for each Friday
      fridayEvents.push({
        eventDate: fridayDate,
        eventTime: '8:00 PM',
        city: 'New Delhi',
        area: 'Connaught Place',
        venue: 'The Imperial Restaurant',
        venueAddress: 'Janpath, Connaught Place, New Delhi',
        venueDetails: 'Fine dining experience with Indian and Continental cuisine',
        maxAttendees: 6,
        currentAttendees: 3, // 3 people already booked
        attendeeIds: [],
        bookingFee: 299,
        status: 'upcoming' as const,
        groupChatCreated: false
      });
    }

    // Insert new Friday events
    const insertedEvents = await DinnerEvent.insertMany(fridayEvents);
    console.log(`✅ Created ${insertedEvents.length} new Friday dinner events`);

    // Display created events
    console.log('\n📋 Created Events:');
    insertedEvents.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.area}, ${event.city}`);
      console.log(`   Date: ${event.eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      })}`);
      console.log(`   Time: ${event.eventTime}`);
      console.log(`   Venue: ${event.venue}`);
      console.log(`   Attendees: ${event.currentAttendees}/${event.maxAttendees}`);
      console.log(`   Fee: ₹${event.bookingFee}`);
    });

    console.log('\n🎉 Events updated successfully!');
  } catch (error) {
    console.error('❌ Error updating events:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

updateFridayEvents();


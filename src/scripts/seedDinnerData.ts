import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import PersonalityQuizQuestion from '../models/personalityQuiz.model';
import DinnerEvent from '../models/dinnerEvent.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citadel';

async function seedDinnerData() {
  try {
    console.log('🌱 Seeding dinner data...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Seed personality quiz questions
    const quizQuestions = [
      {
        questionId: 'pq1',
        question: 'What languages are you willing to speak at dinner?',
        options: ['English', 'Hindi', 'Everything'],
        category: 'social',
        order: 1,
        isActive: true
      },
      {
        questionId: 'pq2',
        question: 'What meal preferences do you have?',
        options: ['Vegetarian', 'Non-Vegetarian', 'Vegan'],
        category: 'food',
        order: 2,
        isActive: true
      },
      {
        questionId: 'pq3',
        question: 'How do you usually spend your weekends?',
        options: ['Exploring new places', 'Relaxing at home', 'Meeting friends', 'Working on hobbies'],
        category: 'lifestyle',
        order: 3,
        isActive: true
      },
      {
        questionId: 'pq4',
        question: 'What type of conversations do you enjoy most?',
        options: ['Deep philosophical talks', 'Light-hearted banter', 'Professional discussions', 'Creative ideas'],
        category: 'personality',
        order: 4,
        isActive: true
      },
      {
        questionId: 'pq5',
        question: 'What\'s your ideal group size for dinner?',
        options: ['Small (2-4 people)', 'Medium (5-6 people)', 'Large (7+ people)'],
        category: 'social',
        order: 5,
        isActive: true
      },
      {
        questionId: 'pq6',
        question: 'How adventurous are you with food?',
        options: ['Very adventurous', 'Somewhat adventurous', 'Prefer familiar dishes'],
        category: 'food',
        order: 6,
        isActive: true
      },
      {
        questionId: 'pq7',
        question: 'What time do you prefer for dinner?',
        options: ['Early (6-7 PM)', 'Standard (7-8 PM)', 'Late (8-9 PM)'],
        category: 'lifestyle',
        order: 7,
        isActive: true
      },
      {
        questionId: 'pq8',
        question: 'How would your friends describe you?',
        options: ['The life of the party', 'The good listener', 'The organizer', 'The creative one'],
        category: 'personality',
        order: 8,
        isActive: true
      },
      {
        questionId: 'pq9',
        question: 'What interests you most?',
        options: ['Technology & Innovation', 'Arts & Culture', 'Sports & Fitness', 'Business & Entrepreneurship'],
        category: 'interests',
        order: 9,
        isActive: true
      },
      {
        questionId: 'pq10',
        question: 'What\'s your approach to meeting new people?',
        options: ['Very outgoing', 'Friendly but cautious', 'Prefer introductions', 'Take time to warm up'],
        category: 'social',
        order: 10,
        isActive: true
      }
    ];

    // Clear existing quiz questions
    await PersonalityQuizQuestion.deleteMany({});
    console.log('🗑️  Cleared existing quiz questions');

    // Insert quiz questions
    await PersonalityQuizQuestion.insertMany(quizQuestions);
    console.log(`✅ Inserted ${quizQuestions.length} personality quiz questions`);

    // Seed dinner events
    const today = new Date();
    const dinnerEvents = [];

    // Create events for next 4 Wednesdays
    for (let i = 0; i < 4; i++) {
      const daysUntilWednesday = (3 - today.getDay() + 7) % 7 || 7;
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + daysUntilWednesday + (i * 7));
      eventDate.setHours(20, 0, 0, 0); // 8:00 PM

      // New Delhi events
      dinnerEvents.push({
        eventDate,
        eventTime: '8:00 PM',
        city: 'New Delhi',
        area: 'Connaught Place',
        venue: 'The Imperial Restaurant',
        venueAddress: 'Janpath, Connaught Place, New Delhi',
        venueDetails: 'Fine dining experience with Indian and Continental cuisine',
        maxAttendees: 6,
        currentAttendees: Math.floor(Math.random() * 3), // 0-2 already booked
        attendeeIds: [],
        bookingFee: 299,
        status: 'upcoming',
        groupChatCreated: false
      });

      dinnerEvents.push({
        eventDate,
        eventTime: '8:00 PM',
        city: 'New Delhi',
        area: 'Hauz Khas',
        venue: 'Social Hauz Khas',
        venueAddress: 'Hauz Khas Village, New Delhi',
        venueDetails: 'Trendy cafe with rooftop seating and diverse menu',
        maxAttendees: 6,
        currentAttendees: Math.floor(Math.random() * 3),
        attendeeIds: [],
        bookingFee: 299,
        status: 'upcoming',
        groupChatCreated: false
      });

      // Mumbai events
      dinnerEvents.push({
        eventDate,
        eventTime: '8:00 PM',
        city: 'Mumbai',
        area: 'Bandra',
        venue: 'Pali Village Cafe',
        venueAddress: 'Pali Hill, Bandra West, Mumbai',
        venueDetails: 'Cozy cafe with European and Mediterranean cuisine',
        maxAttendees: 6,
        currentAttendees: Math.floor(Math.random() * 3),
        attendeeIds: [],
        bookingFee: 349,
        status: 'upcoming',
        groupChatCreated: false
      });

      // Bangalore events
      dinnerEvents.push({
        eventDate,
        eventTime: '8:00 PM',
        city: 'Bangalore',
        area: 'Indiranagar',
        venue: 'Toit Brewpub',
        venueAddress: '298, 100 Feet Road, Indiranagar, Bangalore',
        venueDetails: 'Popular brewpub with craft beers and continental food',
        maxAttendees: 6,
        currentAttendees: Math.floor(Math.random() * 3),
        attendeeIds: [],
        bookingFee: 299,
        status: 'upcoming',
        groupChatCreated: false
      });
    }

    // Add 2 events for next Friday
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    const fridayDate = new Date(today);
    fridayDate.setDate(today.getDate() + daysUntilFriday);
    fridayDate.setHours(20, 0, 0, 0); // 8:00 PM

    // First Friday event - New Delhi
    dinnerEvents.push({
      eventDate: new Date(fridayDate),
      eventTime: '8:00 PM',
      city: 'New Delhi',
      area: 'Khan Market',
      venue: 'Khan Chacha',
      venueAddress: 'Khan Market, New Delhi',
      venueDetails: 'Popular restaurant known for kebabs and North Indian cuisine',
      maxAttendees: 6,
      currentAttendees: Math.floor(Math.random() * 3),
      attendeeIds: [],
      bookingFee: 299,
      status: 'upcoming',
      groupChatCreated: false
    });

    // Second Friday event - Mumbai
    dinnerEvents.push({
      eventDate: new Date(fridayDate),
      eventTime: '8:00 PM',
      city: 'Mumbai',
      area: 'Colaba',
      venue: 'The Table',
      venueAddress: 'Colaba, Mumbai',
      venueDetails: 'Modern restaurant with global cuisine and craft cocktails',
      maxAttendees: 6,
      currentAttendees: Math.floor(Math.random() * 3),
      attendeeIds: [],
      bookingFee: 349,
      status: 'upcoming',
      groupChatCreated: false
    });

    // Clear existing events
    await DinnerEvent.deleteMany({});
    console.log('🗑️  Cleared existing dinner events');

    // Insert dinner events
    await DinnerEvent.insertMany(dinnerEvents);
    console.log(`✅ Inserted ${dinnerEvents.length} dinner events`);

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

seedDinnerData();


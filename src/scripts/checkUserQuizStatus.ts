import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/user.model';

async function checkUserQuizStatus() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get user by email
    const email = process.argv[2];
    if (!email) {
      console.log('Usage: ts-node checkUserQuizStatus.ts <email>');
      process.exit(1);
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    console.log('\n📊 User Quiz Status:');
    console.log('==================');
    console.log('Email:', user.email);
    console.log('Name:', user.name || 'N/A');
    console.log('Has Completed Quiz:', user.hasCompletedQuiz);
    console.log('Quiz Score:', user.quizScore);
    console.log('Quiz Completed At:', user.quizCompletedAt || 'N/A');
    console.log('Is Profile Complete:', user.isProfileComplete);
    console.log('==================\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserQuizStatus();


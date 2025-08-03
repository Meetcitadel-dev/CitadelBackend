import mongoose from 'mongoose';

const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully (Atlas)');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('💡 Check your MONGODB_URI in .env file or install MongoDB locally');
  }
};

export default connectMongoDB; 
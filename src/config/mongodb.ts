import mongoose from 'mongoose';

const connectMongoDB = async (): Promise<void> => {
  try {
    // Always use local MongoDB for now to avoid connection issues
    await mongoose.connect('mongodb://localhost:27017/citadel_events');
    console.log('✅ MongoDB connected successfully (local)');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('💡 Install MongoDB locally or fix Atlas connection');
  }
};

export default connectMongoDB; 
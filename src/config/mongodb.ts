import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectMongoDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  return mongoose.connect(mongoUri)
    .then(async () => {
      console.log('✅ MongoDB connected');

      // Drop old indexes that cause duplicate key errors
      try {
        const db = mongoose.connection.db;
        if (db) {
          // Clean up payments collection indexes
          const paymentsCollection = db.collection('payments');
          const paymentIndexesArr = await paymentsCollection.listIndexes().toArray();
          const paymentIndexNames = paymentIndexesArr.map((idx: any) => idx.name);
          console.log('📋 Current payment indexes:', paymentIndexNames);

          // Drop problematic payment indexes
          if (paymentIndexNames.includes('razorpayOrderId_1')) {
            await paymentsCollection.dropIndex('razorpayOrderId_1');
            console.log('🗑️  Dropped razorpayOrderId_1 index from payments');
          }
          if (paymentIndexNames.includes('razorpayPaymentId_1')) {
            await paymentsCollection.dropIndex('razorpayPaymentId_1');
            console.log('🗑️  Dropped razorpayPaymentId_1 index from payments');
          }
          if (paymentIndexNames.includes('phonepeOrderId_1')) {
            await paymentsCollection.dropIndex('phonepeOrderId_1');
            console.log('🗑️  Dropped phonepeOrderId_1 index from payments');
          }
          if (paymentIndexNames.includes('phonepePaymentId_1')) {
            await paymentsCollection.dropIndex('phonepePaymentId_1');
            console.log('🗑️  Dropped phonepePaymentId_1 index from payments');
          }

          // Clean up bookings collection indexes
          const bookingsCollection = db.collection('bookings');
          const bookingIndexesArr = await bookingsCollection.listIndexes().toArray();
          const bookingIndexNames = bookingIndexesArr.map((idx: any) => idx.name);
          console.log('📋 Current booking indexes:', bookingIndexNames);

          // Drop problematic booking indexes (non-sparse versions)
          if (bookingIndexNames.includes('razorpayOrderId_1')) {
            await bookingsCollection.dropIndex('razorpayOrderId_1');
            console.log('🗑️  Dropped razorpayOrderId_1 index from bookings');
          }
          if (bookingIndexNames.includes('razorpayPaymentId_1')) {
            await bookingsCollection.dropIndex('razorpayPaymentId_1');
            console.log('🗑️  Dropped razorpayPaymentId_1 index from bookings');
          }
          if (bookingIndexNames.includes('phonepeOrderId_1')) {
            await bookingsCollection.dropIndex('phonepeOrderId_1');
            console.log('🗑️  Dropped phonepeOrderId_1 index from bookings');
          }
          if (bookingIndexNames.includes('phonepePaymentId_1')) {
            await bookingsCollection.dropIndex('phonepePaymentId_1');
            console.log('🗑️  Dropped phonepePaymentId_1 index from bookings');
          }

          console.log('✅ Index cleanup completed for both collections');
        }
      } catch (indexError) {
        console.warn('⚠️  Index cleanup warning:', indexError);
        // Don't throw - continue even if index cleanup fails
      }
    })
    .catch(err => {
      console.error('❌ MongoDB connection failed:', err);
      throw err;
    });
};

export default connectMongoDB;
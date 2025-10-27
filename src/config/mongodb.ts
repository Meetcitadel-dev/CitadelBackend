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
          const paymentIndexes = await paymentsCollection.getIndexes();
          console.log('📋 Current payment indexes:', Object.keys(paymentIndexes));

          // Drop problematic payment indexes
          if (paymentIndexes['razorpayOrderId_1']) {
            await paymentsCollection.dropIndex('razorpayOrderId_1');
            console.log('🗑️  Dropped razorpayOrderId_1 index from payments');
          }
          if (paymentIndexes['razorpayPaymentId_1']) {
            await paymentsCollection.dropIndex('razorpayPaymentId_1');
            console.log('🗑️  Dropped razorpayPaymentId_1 index from payments');
          }
          if (paymentIndexes['phonepeOrderId_1']) {
            await paymentsCollection.dropIndex('phonepeOrderId_1');
            console.log('🗑️  Dropped phonepeOrderId_1 index from payments');
          }
          if (paymentIndexes['phonepePaymentId_1']) {
            await paymentsCollection.dropIndex('phonepePaymentId_1');
            console.log('🗑️  Dropped phonepePaymentId_1 index from payments');
          }

          // Clean up bookings collection indexes
          const bookingsCollection = db.collection('bookings');
          const bookingIndexes = await bookingsCollection.getIndexes();
          console.log('📋 Current booking indexes:', Object.keys(bookingIndexes));

          // Drop problematic booking indexes (non-sparse versions)
          if (bookingIndexes['razorpayOrderId_1']) {
            await bookingsCollection.dropIndex('razorpayOrderId_1');
            console.log('🗑️  Dropped razorpayOrderId_1 index from bookings');
          }
          if (bookingIndexes['razorpayPaymentId_1']) {
            await bookingsCollection.dropIndex('razorpayPaymentId_1');
            console.log('🗑️  Dropped razorpayPaymentId_1 index from bookings');
          }
          if (bookingIndexes['phonepeOrderId_1']) {
            await bookingsCollection.dropIndex('phonepeOrderId_1');
            console.log('🗑️  Dropped phonepeOrderId_1 index from bookings');
          }
          if (bookingIndexes['phonepePaymentId_1']) {
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
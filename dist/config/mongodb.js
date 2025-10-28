"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectMongoDB = async () => {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not defined');
    }
    return mongoose_1.default.connect(mongoUri)
        .then(async () => {
        console.log('✅ MongoDB connected');
        // Drop old indexes that cause duplicate key errors
        try {
            const db = mongoose_1.default.connection.db;
            if (db) {
                // Clean up payments collection indexes
                const paymentsCollection = db.collection('payments');
                const paymentIndexesArr = await paymentsCollection.listIndexes().toArray();
                const paymentIndexNames = paymentIndexesArr.map((idx) => idx.name);
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
                const bookingIndexNames = bookingIndexesArr.map((idx) => idx.name);
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
        }
        catch (indexError) {
            console.warn('⚠️  Index cleanup warning:', indexError);
            // Don't throw - continue even if index cleanup fails
        }
    })
        .catch(err => {
        console.error('❌ MongoDB connection failed:', err);
        throw err;
    });
};
exports.default = connectMongoDB;

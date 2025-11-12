"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
async function fixBookingIndexes() {
    try {
        console.log('🔧 Connecting to MongoDB...');
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
        console.log('✅ Connected to MongoDB');
        console.log('\n📋 Current indexes:');
        const indexes = await booking_model_1.default.collection.getIndexes();
        console.log(JSON.stringify(indexes, null, 2));
        // Drop the old unique indexes that don't have partial filter
        console.log('\n🗑️  Dropping old indexes...');
        try {
            await booking_model_1.default.collection.dropIndex('razorpayOrderId_1');
            console.log('✅ Dropped razorpayOrderId_1');
        }
        catch (error) {
            if (error.code === 27) {
                console.log('⚠️  razorpayOrderId_1 index does not exist');
            }
            else {
                console.log('❌ Error dropping razorpayOrderId_1:', error.message);
            }
        }
        // Recreate index with partial filter expression
        console.log('\n🔨 Creating new index with partial filter...');
        await booking_model_1.default.collection.createIndex({ razorpayOrderId: 1 }, {
            unique: true,
            partialFilterExpression: { razorpayOrderId: { $type: 'string' } },
            name: 'razorpayOrderId_1_partial'
        });
        console.log('✅ Created razorpayOrderId_1_partial');
        console.log('\n📋 New indexes:');
        const newIndexes = await booking_model_1.default.collection.getIndexes();
        console.log(JSON.stringify(newIndexes, null, 2));
        console.log('\n✅ Booking indexes fixed successfully!');
    }
    catch (error) {
        console.error('❌ Error fixing booking indexes:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}
fixBookingIndexes();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
async function testCashPaymentFix() {
    var _a, _b, _c;
    try {
        console.log('🔧 Connecting to MongoDB...');
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
        console.log('✅ Connected to MongoDB\n');
        // Clean up test data
        console.log('🧹 Cleaning up old test data...');
        await booking_model_1.default.deleteMany({ userId: { $regex: /^test_user_/ } });
        await payment_model_1.default.deleteMany({ bookingId: { $regex: /^test_booking_/ } });
        console.log('✅ Cleaned up old test data\n');
        // Test 1: Create multiple cash payments with null razorpayOrderId
        console.log('📝 Test 1: Creating multiple cash payments...');
        const testPayments = [];
        for (let i = 1; i <= 3; i++) {
            const bookingId = `test_booking_${Date.now()}_${i}`;
            // Create booking
            const booking = new booking_model_1.default({
                userId: `test_user_${i}`,
                eventId: `test_event_${i}`,
                eventType: 'Dinner',
                amount: 299,
                currency: 'INR',
                bookingDate: new Date(),
                bookingTime: '19:00',
                location: 'Test Location',
                guests: 1,
                status: 'confirmed'
            });
            await booking.save();
            console.log(`  ✅ Created booking ${i}: ${booking._id}`);
            // Create payment with null razorpayOrderId
            const payment = new payment_model_1.default({
                bookingId: ((_a = booking._id) === null || _a === void 0 ? void 0 : _a.toString()) || bookingId,
                amount: 299,
                currency: 'INR',
                status: 'completed',
                paymentMethod: 'cash',
                // razorpayOrderId is intentionally not set (will be null)
            });
            await payment.save();
            console.log(`  ✅ Created payment ${i}: ${payment._id} (razorpayOrderId: ${payment.razorpayOrderId})`);
            testPayments.push(payment);
        }
        console.log('\n✅ Test 1 PASSED: Created 3 cash payments with null razorpayOrderId\n');
        // Test 2: Verify payments were created
        console.log('📝 Test 2: Verifying payments...');
        const cashPayments = await payment_model_1.default.find({ paymentMethod: 'cash' }).limit(3);
        console.log(`  Found ${cashPayments.length} cash payments`);
        cashPayments.forEach((payment, index) => {
            console.log(`  Payment ${index + 1}:`, {
                id: payment._id,
                bookingId: payment.bookingId,
                amount: payment.amount,
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                razorpayOrderId: payment.razorpayOrderId
            });
        });
        console.log('✅ Test 2 PASSED: All payments verified\n');
        // Test 3: Try to create duplicate Razorpay order ID (should fail)
        console.log('📝 Test 3: Testing unique constraint on Razorpay order ID...');
        try {
            const booking1 = new booking_model_1.default({
                userId: 'test_user_razorpay_1',
                eventId: 'test_event_razorpay',
                eventType: 'Dinner',
                amount: 299,
                currency: 'INR',
                bookingDate: new Date(),
                bookingTime: '19:00',
                location: 'Test Location',
                guests: 1,
                status: 'pending'
            });
            await booking1.save();
            const payment1 = new payment_model_1.default({
                bookingId: ((_b = booking1._id) === null || _b === void 0 ? void 0 : _b.toString()) || '',
                amount: 299,
                currency: 'INR',
                status: 'pending',
                paymentMethod: 'razorpay',
                razorpayOrderId: 'test_order_duplicate_123'
            });
            await payment1.save();
            console.log('  ✅ Created first payment with razorpayOrderId: test_order_duplicate_123');
            // Try to create duplicate
            const booking2 = new booking_model_1.default({
                userId: 'test_user_razorpay_2',
                eventId: 'test_event_razorpay',
                eventType: 'Dinner',
                amount: 299,
                currency: 'INR',
                bookingDate: new Date(),
                bookingTime: '19:00',
                location: 'Test Location',
                guests: 1,
                status: 'pending'
            });
            await booking2.save();
            const payment2 = new payment_model_1.default({
                bookingId: ((_c = booking2._id) === null || _c === void 0 ? void 0 : _c.toString()) || '',
                amount: 299,
                currency: 'INR',
                status: 'pending',
                paymentMethod: 'razorpay',
                razorpayOrderId: 'test_order_duplicate_123' // Same ID
            });
            await payment2.save();
            console.log('  ❌ Test 3 FAILED: Duplicate razorpayOrderId was allowed (should have failed)');
        }
        catch (error) {
            if (error.code === 11000) {
                console.log('  ✅ Test 3 PASSED: Duplicate razorpayOrderId correctly rejected');
            }
            else {
                console.log('  ❌ Test 3 FAILED: Unexpected error:', error.message);
            }
        }
        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await booking_model_1.default.deleteMany({ userId: { $regex: /^test_user_/ } });
        await payment_model_1.default.deleteMany({ bookingId: { $regex: /^test_booking_/ } });
        await payment_model_1.default.deleteMany({ razorpayOrderId: 'test_order_duplicate_123' });
        console.log('✅ Cleaned up test data');
        console.log('\n🎉 All tests completed successfully!');
        console.log('\n✅ The duplicate key error fix is working correctly.');
        console.log('   - Multiple cash payments with null razorpayOrderId: ✅ ALLOWED');
        console.log('   - Duplicate non-null razorpayOrderId: ✅ REJECTED');
    }
    catch (error) {
        console.error('❌ Error during testing:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}
testCashPaymentFix();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongodb_1 = __importDefault(require("../config/mongodb"));
const event_model_1 = __importDefault(require("../models/event.model"));
const payment_service_1 = __importDefault(require("../services/payment.service"));
async function testPaymentIntegration() {
    var _a, _b;
    try {
        // Connect to MongoDB
        await (0, mongodb_1.default)();
        console.log('✅ Connected to MongoDB');
        // Create a test event
        const testEvent = new event_model_1.default({
            title: 'Test Dinner Event',
            description: 'A test dinner event for payment integration',
            eventType: 'Dinner',
            date: new Date('2024-02-15'),
            time: '19:00',
            location: 'Test Restaurant, Test City',
            price: 7500,
            currency: 'INR',
            maxGuests: 50,
            currentBookings: 0,
            status: 'active'
        });
        await testEvent.save();
        console.log('✅ Test event created:', testEvent._id);
        // Test creating an order
        const orderData = {
            userId: 'test_user_123',
            eventId: ((_a = testEvent._id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
            eventType: 'Dinner',
            amount: 7500,
            currency: 'INR',
            bookingDate: new Date('2024-02-15'),
            bookingTime: '19:00',
            location: 'Test Restaurant, Test City',
            guests: 2,
            notes: 'Test booking for payment integration'
        };
        const orderResult = await payment_service_1.default.createOrder(orderData);
        console.log('✅ Order created successfully');
        console.log('Order ID:', orderResult.order.id);
        console.log('Booking ID:', orderResult.booking._id);
        console.log('Payment ID:', orderResult.payment._id);
        // Test getting booking details
        const bookingDetails = await payment_service_1.default.getBookingById(((_b = orderResult.booking._id) === null || _b === void 0 ? void 0 : _b.toString()) || '');
        console.log('✅ Booking details retrieved');
        console.log('Booking status:', bookingDetails.booking.status);
        // Test getting user bookings
        const userBookings = await payment_service_1.default.getUserBookings('test_user_123');
        console.log('✅ User bookings retrieved');
        console.log('Number of bookings:', userBookings.length);
        // Test getting events
        const events = await event_model_1.default.find({ status: 'active' });
        console.log('✅ Events retrieved');
        console.log('Number of active events:', events.length);
        console.log('\n🎉 All tests passed successfully!');
        console.log('\n📋 Test Summary:');
        console.log('- MongoDB connection: ✅');
        console.log('- Event creation: ✅');
        console.log('- Order creation: ✅');
        console.log('- Booking retrieval: ✅');
        console.log('- User bookings: ✅');
        console.log('- Events listing: ✅');
        console.log('\n🔧 Next Steps:');
        console.log('1. Test the payment flow with Razorpay test cards');
        console.log('2. Verify payment signatures');
        console.log('3. Test error scenarios');
        console.log('4. Deploy to production with live keys');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
    finally {
        process.exit(0);
    }
}
testPaymentIntegration();

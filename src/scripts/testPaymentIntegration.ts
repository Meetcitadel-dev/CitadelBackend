import dotenv from 'dotenv';
dotenv.config();
import connectMongoDB from '../config/mongodb';
import Event from '../models/event.model';
import Booking from '../models/booking.model';
import Payment from '../models/payment.model';
import paymentService from '../services/payment.service';

async function testPaymentIntegration() {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    console.log('✅ Connected to MongoDB');

    // Create a test event
    const testEvent = new Event({
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
      eventId: testEvent._id?.toString() || '',
      eventType: 'Dinner',
      amount: 7500,
      currency: 'INR',
      bookingDate: new Date('2024-02-15'),
      bookingTime: '19:00',
      location: 'Test Restaurant, Test City',
      guests: 2,
      notes: 'Test booking for payment integration'
    };

    const orderResult = await paymentService.createOrder(orderData);
    console.log('✅ Order created successfully');
    console.log('Order ID:', orderResult.order.id);
    console.log('Booking ID:', orderResult.booking._id);
    console.log('Payment ID:', orderResult.payment._id);

    // Test getting booking details
    const bookingDetails = await paymentService.getBookingById(orderResult.booking._id?.toString() || '');
    console.log('✅ Booking details retrieved');
    console.log('Booking status:', bookingDetails.booking.status);

    // Test getting user bookings
    const userBookings = await paymentService.getUserBookings('test_user_123');
    console.log('✅ User bookings retrieved');
    console.log('Number of bookings:', userBookings.length);

    // Test getting events
    const events = await Event.find({ status: 'active' });
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

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testPaymentIntegration(); 
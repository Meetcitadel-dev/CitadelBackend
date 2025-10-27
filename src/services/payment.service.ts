import Razorpay from 'razorpay';
import Booking from '../models/booking.model';
import Payment from '../models/payment.model';
import Event from '../models/event.model';
import DinnerEvent from '../models/dinnerEvent.model';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

class PaymentService {

  async createOrder(bookingData: {
    userId: string;
    eventId: string;
    eventType: string;
    amount: number;
    currency: string;
    bookingDate: Date;
    bookingTime: string;
    location: string;
    guests: number;
    notes?: string;
  }) {
    try {
      console.log('Creating order with data:', bookingData);

      // Create booking record
      const booking = new Booking({
        userId: bookingData.userId,
        eventId: bookingData.eventId,
        eventType: bookingData.eventType,
        amount: bookingData.amount,
        currency: bookingData.currency,
        bookingDate: bookingData.bookingDate,
        bookingTime: bookingData.bookingTime,
        location: bookingData.location,
        guests: bookingData.guests,
        notes: bookingData.notes,
        status: 'pending'
      });

      await booking.save();
      console.log('Booking created:', booking._id);

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: bookingData.amount * 100, // Convert to paise
        currency: bookingData.currency,
        receipt: `booking_${booking._id}`,
        notes: {
          bookingId: booking._id?.toString(),
          userId: bookingData.userId,
          eventId: bookingData.eventId,
          eventType: bookingData.eventType,
          location: bookingData.location,
          bookingDate: bookingData.bookingDate.toISOString(),
          bookingTime: bookingData.bookingTime
        }
      });

      console.log('Razorpay order created:', razorpayOrder.id);

      // Create payment record
      const payment = new Payment({
        bookingId: booking._id?.toString() || '',
        razorpayOrderId: razorpayOrder.id,
        amount: bookingData.amount,
        currency: bookingData.currency,
        status: 'pending'
      });

      await payment.save();
      console.log('Payment record created:', payment._id);

      // Update booking with Razorpay order ID
      (booking as any).razorpayOrderId = razorpayOrder.id;
      await booking.save();

      return {
        order: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          status: razorpayOrder.status
        },
        booking: booking,
        payment: payment
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    try {
      console.log('Verifying payment:', { razorpayOrderId, razorpayPaymentId });

      // Find payment record by Razorpay order ID
      const payment = await Payment.findOne({ razorpayOrderId });
      if (!payment) {
        console.error('Payment record not found for order:', razorpayOrderId);
        throw new Error('Payment record not found');
      }

      // Verify signature using Razorpay SDK
      const crypto = require('crypto');
      const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      const data = razorpayOrderId + '|' + razorpayPaymentId;
      shasum.update(data);
      const digest = shasum.digest('hex');

      if (digest !== razorpaySignature) {
        console.error('Signature verification failed');
        throw new Error('Payment signature verification failed');
      }

      console.log('Signature verified successfully');

      // Update payment status
      payment.status = 'completed';
      (payment as any).razorpayPaymentId = razorpayPaymentId;
      (payment as any).razorpaySignature = razorpaySignature;
      await payment.save();

      // Find and update booking status
      const booking = await Booking.findById(payment.bookingId);
      if (booking) {
        booking.status = 'confirmed';
        (booking as any).razorpayPaymentId = razorpayPaymentId;
        await booking.save();

        console.log('Booking confirmed:', booking._id);

        // Update event booking count (for regular Event model)
        const event = await Event.findById(booking.eventId);
        if (event) {
          (event as any).currentBookings = ((event as any).currentBookings || 0) + (booking as any).guests;
          await event.save();
          console.log('Event booking count updated');
        }

        // Also try to update DinnerEvent if it exists
        const dinnerEvent = await DinnerEvent.findById(booking.eventId);
        if (dinnerEvent) {
          dinnerEvent.currentAttendees += (booking as any).guests || 1;
          dinnerEvent.attendeeIds.push(booking.userId);
          await dinnerEvent.save();
          console.log('DinnerEvent attendees updated');
        }
      }

      return {
        success: true,
        message: 'Payment verified successfully',
        bookingId: booking?._id?.toString() || '',
        paymentId: payment._id?.toString() || ''
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  async createCashPayment(bookingData: {
    userId: string;
    eventId: string;
    eventType: string;
    amount: number;
    currency: string;
    bookingDate: Date;
    bookingTime: string;
    location: string;
    guests: number;
    notes?: string;
  }) {
    try {
      console.log('Creating cash payment booking:', bookingData);

      // Create booking record
      const booking = new Booking({
        userId: bookingData.userId,
        eventId: bookingData.eventId,
        eventType: bookingData.eventType,
        amount: bookingData.amount,
        currency: bookingData.currency,
        bookingDate: bookingData.bookingDate,
        bookingTime: bookingData.bookingTime,
        location: bookingData.location,
        guests: bookingData.guests,
        notes: bookingData.notes,
        status: 'confirmed' // Cash payment is immediately confirmed
      });

      await booking.save();
      console.log('Cash booking created:', booking._id);

      // Create payment record with cash status
      const payment = new Payment({
        bookingId: booking._id?.toString() || '',
        amount: bookingData.amount,
        currency: bookingData.currency,
        status: 'completed', // Cash payment is immediately completed
        paymentMethod: 'cash'
      });

      await payment.save();
      console.log('Cash payment record created:', payment._id);

      // Update event attendees (for DinnerEvent)
      const dinnerEvent = await DinnerEvent.findById(bookingData.eventId);
      if (dinnerEvent) {
        dinnerEvent.currentAttendees += bookingData.guests;
        dinnerEvent.attendeeIds.push(bookingData.userId);
        await dinnerEvent.save();
        console.log('DinnerEvent attendees updated');
      }

      // Also update regular Event if it exists
      const event = await Event.findById(bookingData.eventId);
      if (event) {
        (event as any).currentBookings = ((event as any).currentBookings || 0) + bookingData.guests;
        await event.save();
        console.log('Event booking count updated');
      }

      return {
        booking: booking,
        payment: payment
      };
    } catch (error) {
      console.error('Error creating cash payment:', error);
      throw error;
    }
  }

  async getBookingById(bookingId: string) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const payment = await Payment.findOne({ bookingId: bookingId });
      const event = await Event.findById(booking.eventId);

      return {
        booking,
        payment,
        event
      };
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  async getUserBookings(userId: string) {
    try {
      const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
      
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          const payment = await Payment.findOne({ bookingId: booking._id?.toString() || '' });
          const event = await Event.findById(booking.eventId);
          
          return {
            booking,
            payment,
            event
          };
        })
      );

      return bookingsWithDetails;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }
}

export default new PaymentService(); 
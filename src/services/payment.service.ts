import phonepeService from './phonepe.service';
import Booking from '../models/booking.model';
import Payment from '../models/payment.model';
import Event from '../models/event.model';

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

      // Create PhonePe order
      const merchantTransactionId = `booking_${booking._id}_${Date.now()}`;
      const callbackUrl = `${process.env.BASE_URL}/api/payments/verify`;
      const redirectUrl = `${process.env.FRONTEND_URL}/payment-success`;

      const order = await phonepeService.createOrder(
        bookingData.amount,
        bookingData.currency,
        merchantTransactionId,
        callbackUrl,
        redirectUrl
      );

      // Create payment record
      const payment = new Payment({
        bookingId: booking._id?.toString() || '',
        phonepeOrderId: order.data.merchantTransactionId,
        amount: bookingData.amount,
        currency: bookingData.currency,
        status: 'pending'
      });

      await payment.save();

      // Update booking with order ID
      booking.phonepeOrderId = order.data.merchantTransactionId;
      await booking.save();

      return {
        order: order,
        booking: booking,
        payment: payment
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async verifyPayment(merchantTransactionId: string) {
    try {
      // Verify payment with PhonePe
      const verificationResult = await phonepeService.verifyPayment(merchantTransactionId);

      if (verificationResult.code !== 'PAYMENT_SUCCESS') {
        throw new Error('Payment verification failed');
      }

      // Find payment record
      const payment = await Payment.findOne({ phonepeOrderId: merchantTransactionId });
      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Update payment status
      payment.status = 'completed';
      payment.phonepePaymentId = verificationResult.data.transactionId;
      payment.signature = verificationResult.data.signature;
      await payment.save();

      // Update booking status
      const booking = await Booking.findOne({ phonepeOrderId: merchantTransactionId });
      if (booking) {
        booking.status = 'confirmed';
        booking.phonepePaymentId = verificationResult.data.transactionId;
        await booking.save();

        // Update event booking count
        const event = await Event.findById(booking.eventId);
        if (event) {
          event.currentBookings += booking.guests;
          await event.save();
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
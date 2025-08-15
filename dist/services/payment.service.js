"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const phonepe_service_1 = __importDefault(require("./phonepe.service"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
const event_model_1 = __importDefault(require("../models/event.model"));
class PaymentService {
    async createOrder(bookingData) {
        try {
            // Create booking record
            const booking = new booking_model_1.default({
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
            const order = await phonepe_service_1.default.createOrder(bookingData.amount, bookingData.currency, merchantTransactionId, callbackUrl, redirectUrl);
            // Create payment record
            const payment = new payment_model_1.default({
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
        }
        catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }
    async verifyPayment(merchantTransactionId) {
        try {
            // Verify payment with PhonePe
            const verificationResult = await phonepe_service_1.default.verifyPayment(merchantTransactionId);
            if (verificationResult.code !== 'PAYMENT_SUCCESS') {
                throw new Error('Payment verification failed');
            }
            // Find payment record
            const payment = await payment_model_1.default.findOne({ phonepeOrderId: merchantTransactionId });
            if (!payment) {
                throw new Error('Payment record not found');
            }
            // Update payment status
            payment.status = 'completed';
            payment.phonepePaymentId = verificationResult.data.transactionId;
            payment.signature = verificationResult.data.signature;
            await payment.save();
            // Update booking status
            const booking = await booking_model_1.default.findOne({ phonepeOrderId: merchantTransactionId });
            if (booking) {
                booking.status = 'confirmed';
                booking.phonepePaymentId = verificationResult.data.transactionId;
                await booking.save();
                // Update event booking count
                const event = await event_model_1.default.findById(booking.eventId);
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
        }
        catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }
    async getBookingById(bookingId) {
        try {
            const booking = await booking_model_1.default.findById(bookingId);
            if (!booking) {
                throw new Error('Booking not found');
            }
            const payment = await payment_model_1.default.findOne({ bookingId: bookingId });
            const event = await event_model_1.default.findById(booking.eventId);
            return {
                booking,
                payment,
                event
            };
        }
        catch (error) {
            console.error('Error getting booking:', error);
            throw error;
        }
    }
    async getUserBookings(userId) {
        try {
            const bookings = await booking_model_1.default.find({ userId }).sort({ createdAt: -1 });
            const bookingsWithDetails = await Promise.all(bookings.map(async (booking) => {
                const payment = await payment_model_1.default.findOne({ bookingId: booking._id?.toString() || '' });
                const event = await event_model_1.default.findById(booking.eventId);
                return {
                    booking,
                    payment,
                    event
                };
            }));
            return bookingsWithDetails;
        }
        catch (error) {
            console.error('Error getting user bookings:', error);
            throw error;
        }
    }
}
exports.default = new PaymentService();

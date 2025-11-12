"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const razorpay_1 = __importDefault(require("razorpay"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
const event_model_1 = __importDefault(require("../models/event.model"));
const dinnerEvent_model_1 = __importDefault(require("../models/dinnerEvent.model"));
// Initialize Razorpay
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
class PaymentService {
    async createOrder(bookingData) {
        var _a, _b;
        try {
            console.log('Creating order with data:', bookingData);
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
            console.log('Booking created:', booking._id);
            // Create Razorpay order
            const razorpayOrder = await razorpay.orders.create({
                amount: bookingData.amount * 100, // Convert to paise
                currency: bookingData.currency,
                receipt: `booking_${booking._id}`,
                notes: {
                    bookingId: ((_a = booking._id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
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
            const payment = new payment_model_1.default({
                bookingId: ((_b = booking._id) === null || _b === void 0 ? void 0 : _b.toString()) || '',
                razorpayOrderId: razorpayOrder.id,
                amount: bookingData.amount,
                currency: bookingData.currency,
                status: 'pending'
            });
            await payment.save();
            console.log('Payment record created:', payment._id);
            // Update booking with Razorpay order ID
            booking.razorpayOrderId = razorpayOrder.id;
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
        }
        catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }
    async verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        var _a, _b;
        try {
            console.log('Verifying payment:', { razorpayOrderId, razorpayPaymentId });
            // Find payment record by Razorpay order ID
            const payment = await payment_model_1.default.findOne({ razorpayOrderId });
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
            payment.razorpayPaymentId = razorpayPaymentId;
            payment.razorpaySignature = razorpaySignature;
            await payment.save();
            // Find and update booking status
            const booking = await booking_model_1.default.findById(payment.bookingId);
            if (booking) {
                booking.status = 'confirmed';
                booking.razorpayPaymentId = razorpayPaymentId;
                await booking.save();
                console.log('Booking confirmed:', booking._id);
                // Update event booking count (for regular Event model)
                const event = await event_model_1.default.findById(booking.eventId);
                if (event) {
                    event.currentBookings = (event.currentBookings || 0) + booking.guests;
                    await event.save();
                    console.log('Event booking count updated');
                }
                // Also try to update DinnerEvent if it exists
                const dinnerEvent = await dinnerEvent_model_1.default.findById(booking.eventId);
                if (dinnerEvent) {
                    dinnerEvent.currentAttendees += booking.guests || 1;
                    dinnerEvent.attendeeIds.push(booking.userId);
                    await dinnerEvent.save();
                    console.log('DinnerEvent attendees updated');
                }
            }
            return {
                success: true,
                message: 'Payment verified successfully',
                bookingId: ((_a = booking === null || booking === void 0 ? void 0 : booking._id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                paymentId: ((_b = payment._id) === null || _b === void 0 ? void 0 : _b.toString()) || ''
            };
        }
        catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }
    async createCashPayment(bookingData) {
        var _a;
        try {
            console.log('Creating cash payment booking:', bookingData);
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
                status: 'confirmed' // Cash payment is immediately confirmed
            });
            await booking.save();
            console.log('Cash booking created:', booking._id);
            // Create payment record with cash status
            const payment = new payment_model_1.default({
                bookingId: ((_a = booking._id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                amount: bookingData.amount,
                currency: bookingData.currency,
                status: 'completed', // Cash payment is immediately completed
                paymentMethod: 'cash'
            });
            await payment.save();
            console.log('Cash payment record created:', payment._id);
            // Update event attendees (for DinnerEvent)
            const dinnerEvent = await dinnerEvent_model_1.default.findById(bookingData.eventId);
            if (dinnerEvent) {
                dinnerEvent.currentAttendees += bookingData.guests;
                dinnerEvent.attendeeIds.push(bookingData.userId);
                await dinnerEvent.save();
                console.log('DinnerEvent attendees updated');
            }
            // Also update regular Event if it exists
            const event = await event_model_1.default.findById(bookingData.eventId);
            if (event) {
                event.currentBookings = (event.currentBookings || 0) + bookingData.guests;
                await event.save();
                console.log('Event booking count updated');
            }
            return {
                booking: booking,
                payment: payment
            };
        }
        catch (error) {
            console.error('Error creating cash payment:', error);
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
                var _a;
                const payment = await payment_model_1.default.findOne({ bookingId: ((_a = booking._id) === null || _a === void 0 ? void 0 : _a.toString()) || '' });
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

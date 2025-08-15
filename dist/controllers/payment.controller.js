"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const payment_service_1 = __importDefault(require("../services/payment.service"));
const event_model_1 = __importDefault(require("../models/event.model"));
const phonepe_service_1 = __importDefault(require("../services/phonepe.service"));
class PaymentController {
    constructor() {
        this.createPhonePeOrder = async (req, res) => {
            try {
                const { amount, currency = 'INR', receipt, notes } = req.body;
                // Validate required fields
                if (!amount || !receipt) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields: amount and receipt are required'
                    });
                }
                // Create PhonePe order
                const merchantTransactionId = `${receipt}_${Date.now()}`;
                const callbackUrl = `${process.env.BASE_URL}/api/payments/verify`;
                const redirectUrl = `${process.env.FRONTEND_URL}/payment-success`;
                const order = await phonepe_service_1.default.createOrder(amount, currency, merchantTransactionId, callbackUrl, redirectUrl);
                res.status(201).json({
                    success: true,
                    message: 'Order created successfully',
                    data: order
                });
            }
            catch (error) {
                console.error('Error creating PhonePe order:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to create order',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.createOrder = async (req, res) => {
            try {
                // Check if this is a PhonePe order request (frontend format)
                if (req.body.amount && req.body.receipt && !req.body.userId) {
                    return await this.createPhonePeOrder(req, res);
                }
                const { userId, eventId, eventType, amount, currency = 'INR', bookingDate, bookingTime, location, guests = 1, notes } = req.body;
                // Validate required fields
                if (!userId || !eventId || !eventType || !amount || !bookingDate || !bookingTime || !location) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields'
                    });
                }
                // Check if event exists and is active
                const event = await event_model_1.default.findById(eventId);
                if (!event) {
                    return res.status(404).json({
                        success: false,
                        message: 'Event not found'
                    });
                }
                if (event.status !== 'active') {
                    return res.status(400).json({
                        success: false,
                        message: 'Event is not available for booking'
                    });
                }
                // Check if event has capacity
                if (event.currentBookings + guests > event.maxGuests) {
                    return res.status(400).json({
                        success: false,
                        message: 'Event is fully booked'
                    });
                }
                const result = await payment_service_1.default.createOrder({
                    userId,
                    eventId,
                    eventType,
                    amount,
                    currency,
                    bookingDate: new Date(bookingDate),
                    bookingTime,
                    location,
                    guests,
                    notes
                });
                res.status(201).json({
                    success: true,
                    message: 'Order created successfully',
                    data: {
                        order: result.order,
                        booking: result.booking,
                        payment: result.payment
                    }
                });
            }
            catch (error) {
                console.error('Error creating order:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to create order',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.verifyPayment = async (req, res) => {
            try {
                const { merchantTransactionId } = req.body;
                // Validate required fields
                if (!merchantTransactionId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields: merchantTransactionId is required'
                    });
                }
                const result = await payment_service_1.default.verifyPayment(merchantTransactionId);
                res.json({
                    success: true,
                    message: result.message,
                    data: {
                        bookingId: result.bookingId,
                        paymentId: result.paymentId
                    }
                });
            }
            catch (error) {
                console.error('Error verifying payment:', error);
                res.status(400).json({
                    success: false,
                    message: 'Payment verification failed',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.getBooking = async (req, res) => {
            try {
                const { bookingId } = req.params;
                if (!bookingId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Booking ID is required'
                    });
                }
                const result = await payment_service_1.default.getBookingById(bookingId);
                res.json({
                    success: true,
                    message: 'Booking retrieved successfully',
                    data: result
                });
            }
            catch (error) {
                console.error('Error getting booking:', error);
                res.status(404).json({
                    success: false,
                    message: 'Booking not found',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.getUserBookings = async (req, res) => {
            try {
                const { userId } = req.params;
                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: 'User ID is required'
                    });
                }
                const bookings = await payment_service_1.default.getUserBookings(userId);
                res.json({
                    success: true,
                    message: 'User bookings retrieved successfully',
                    data: bookings
                });
            }
            catch (error) {
                console.error('Error getting user bookings:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to get user bookings',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.getEvents = async (req, res) => {
            try {
                const { eventType, status = 'active' } = req.query;
                let query = { status };
                if (eventType) {
                    query.eventType = eventType;
                }
                const events = await event_model_1.default.find(query).sort({ createdAt: -1 });
                res.json({
                    success: true,
                    message: 'Events retrieved successfully',
                    data: events
                });
            }
            catch (error) {
                console.error('Error getting events:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to get events',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.createEvent = async (req, res) => {
            try {
                const { title, description, eventType, date, time, location, price, currency = 'INR', maxGuests, imageUrl } = req.body;
                // Validate required fields
                if (!title || !description || !eventType || !date || !time || !location || !price || !maxGuests) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields'
                    });
                }
                const event = new event_model_1.default({
                    title,
                    description,
                    eventType,
                    date: new Date(date),
                    time,
                    location,
                    price,
                    currency,
                    maxGuests,
                    imageUrl
                });
                await event.save();
                res.status(201).json({
                    success: true,
                    message: 'Event created successfully',
                    data: event
                });
            }
            catch (error) {
                console.error('Error creating event:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to create event',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
    }
}
exports.default = new PaymentController();

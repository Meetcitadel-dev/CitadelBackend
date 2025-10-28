"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const payment_service_1 = __importDefault(require("../services/payment.service"));
const event_model_1 = __importDefault(require("../models/event.model"));
const dinnerEvent_model_1 = __importDefault(require("../models/dinnerEvent.model"));
const dinnerBooking_model_1 = __importDefault(require("../models/dinnerBooking.model"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const phonepe_service_1 = __importDefault(require("../services/phonepe.service"));
const bookingEmail_service_1 = require("../services/bookingEmail.service");
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
                    const missingFields = [];
                    if (!userId)
                        missingFields.push('userId');
                    if (!eventId)
                        missingFields.push('eventId');
                    if (!eventType)
                        missingFields.push('eventType');
                    if (!amount)
                        missingFields.push('amount');
                    if (!bookingDate)
                        missingFields.push('bookingDate');
                    if (!bookingTime)
                        missingFields.push('bookingTime');
                    if (!location)
                        missingFields.push('location');
                    console.error('Missing required fields:', missingFields, 'Received body:', req.body);
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields',
                        missingFields: missingFields,
                        receivedFields: {
                            userId: !!userId,
                            eventId: !!eventId,
                            eventType: !!eventType,
                            amount: !!amount,
                            bookingDate: !!bookingDate,
                            bookingTime: !!bookingTime,
                            location: !!location
                        }
                    });
                }
                // Check if event exists and is active
                // Try to find in DinnerEvent first (for dinner bookings), then Event
                console.log('Looking for event with ID:', eventId);
                let event = await dinnerEvent_model_1.default.findById(eventId);
                if (!event) {
                    event = await event_model_1.default.findById(eventId);
                }
                if (!event) {
                    console.error('Event not found with ID:', eventId);
                    return res.status(404).json({
                        success: false,
                        message: 'Event not found',
                        eventId: eventId
                    });
                }
                console.log('Event found:', event._id, 'Type:', event.constructor.name);
                // Check if event is active (DinnerEvent uses 'status', Event uses 'status')
                const eventStatus = event.status;
                if (eventStatus && eventStatus !== 'active' && eventStatus !== 'upcoming') {
                    return res.status(400).json({
                        success: false,
                        message: 'Event is not available for booking'
                    });
                }
                // Check if event has capacity
                // DinnerEvent uses 'currentAttendees' and 'maxAttendees', Event uses 'currentBookings' and 'maxGuests'
                const currentBookings = event.currentAttendees || event.currentBookings || 0;
                const maxCapacity = event.maxAttendees || event.maxGuests || 6;
                if (currentBookings + guests > maxCapacity) {
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
                const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
                // Validate required fields
                if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required'
                    });
                }
                const result = await payment_service_1.default.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
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
        // Cash Payment Endpoint - Simple Direct Booking
        this.createCashPayment = async (req, res) => {
            try {
                const { userId, eventId, eventType, amount, currency = 'INR', bookingDate, bookingTime, location, guests = 1, notes } = req.body;
                // Validate required fields
                if (!userId || !eventId || !eventType || !amount || !bookingDate || !bookingTime || !location) {
                    const missingFields = [];
                    if (!userId)
                        missingFields.push('userId');
                    if (!eventId)
                        missingFields.push('eventId');
                    if (!eventType)
                        missingFields.push('eventType');
                    if (!amount)
                        missingFields.push('amount');
                    if (!bookingDate)
                        missingFields.push('bookingDate');
                    if (!bookingTime)
                        missingFields.push('bookingTime');
                    if (!location)
                        missingFields.push('location');
                    console.error('Missing required fields for cash payment:', missingFields);
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields',
                        missingFields
                    });
                }
                // Check if event exists
                let event = await dinnerEvent_model_1.default.findById(eventId);
                if (!event) {
                    event = await event_model_1.default.findById(eventId);
                }
                if (!event) {
                    console.error('Event not found for cash payment:', eventId);
                    return res.status(404).json({
                        success: false,
                        message: 'Event not found'
                    });
                }
                // Check capacity
                const currentBookings = event.currentAttendees || event.currentBookings || 0;
                const maxCapacity = event.maxAttendees || event.maxGuests || 6;
                if (currentBookings + guests > maxCapacity) {
                    return res.status(400).json({
                        success: false,
                        message: 'Event is fully booked'
                    });
                }
                console.log('✅ Creating direct booking for user:', userId);
                // Generate unique payment ID for cash payment
                const paymentId = `CASH_${Date.now()}_${userId.substring(0, 8)}`;
                console.log('✅ Generated payment ID:', paymentId);
                // Create DinnerBooking directly (for dinner events)
                const booking = await dinnerBooking_model_1.default.create({
                    userId,
                    eventId,
                    paymentId,
                    paymentStatus: 'pending', // Cash payments are pending until paid at venue
                    paymentAmount: amount,
                    paymentMethod: 'cash',
                    paymentGateway: 'cash',
                    bookingStatus: 'confirmed',
                    bookingDate: new Date()
                });
                console.log('✅ DinnerBooking created:', booking._id);
                // Create payment record (without razorpay fields)
                const payment = new payment_model_1.default({
                    bookingId: booking._id?.toString() || '',
                    amount,
                    currency,
                    status: 'pending', // Cash payment is pending
                    paymentMethod: 'cash',
                    // Don't set razorpayOrderId, razorpayPaymentId - leave them null
                });
                await payment.save();
                console.log('✅ Payment record created:', payment._id);
                // Update event attendees
                if (event instanceof dinnerEvent_model_1.default) {
                    event.currentAttendees += guests;
                    event.attendeeIds.push(userId);
                    await event.save();
                    console.log('✅ DinnerEvent attendees updated');
                }
                else if (event instanceof event_model_1.default) {
                    event.currentBookings = (event.currentBookings || 0) + guests;
                    await event.save();
                    console.log('✅ Event booking count updated');
                }
                // Get user details and send email
                const user = await user_model_1.default.findById(userId);
                if (user && user.email) {
                    try {
                        console.log('📧 Sending booking confirmation email to:', user.email);
                        await (0, bookingEmail_service_1.sendBookingConfirmationEmail)({
                            userName: user.name || user.username || 'Guest',
                            userEmail: user.email,
                            eventDate: bookingDate,
                            eventTime: bookingTime,
                            city: event.city || 'Unknown',
                            area: event.area || 'Unknown',
                            venue: event.venue,
                            venueAddress: event.venueAddress,
                            bookingFee: amount,
                            paymentMethod: 'cash',
                            paymentGateway: 'cash',
                            paymentStatus: 'completed',
                            bookingId: booking._id?.toString() || ''
                        });
                        console.log('✅ Booking confirmation email sent successfully');
                    }
                    catch (emailError) {
                        // Don't fail the booking if email fails
                        console.error('❌ Failed to send booking confirmation email:', emailError);
                    }
                }
                res.status(201).json({
                    success: true,
                    message: 'Dinner booked successfully!',
                    data: {
                        bookingId: booking._id?.toString(),
                        booking: {
                            id: booking._id,
                            bookingStatus: booking.bookingStatus,
                            eventId: booking.eventId,
                            paymentAmount: booking.paymentAmount,
                            paymentStatus: booking.paymentStatus
                        },
                        payment: {
                            id: payment._id,
                            status: payment.status,
                            paymentMethod: payment.paymentMethod || 'cash'
                        }
                    }
                });
            }
            catch (error) {
                console.error('Error creating cash payment:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to book dinner',
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

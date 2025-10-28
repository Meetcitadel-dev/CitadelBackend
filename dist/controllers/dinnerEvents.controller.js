"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBookings = exports.createBooking = exports.getEventDetails = exports.getUpcomingEvents = void 0;
const dinnerEvent_model_1 = __importDefault(require("../models/dinnerEvent.model"));
const dinnerBooking_model_1 = __importDefault(require("../models/dinnerBooking.model"));
const dinnerPreferences_model_1 = __importDefault(require("../models/dinnerPreferences.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const bookingEmail_service_1 = require("../services/bookingEmail.service");
// Get upcoming dinner events based on user preferences
const getUpcomingEvents = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        // Get user preferences
        const preferences = await dinnerPreferences_model_1.default.findOne({ userId });
        const city = preferences?.city || req.query.city;
        if (!city) {
            return res.status(400).json({
                success: false,
                message: 'City is required'
            });
        }
        // Get upcoming events for the city
        const events = await dinnerEvent_model_1.default.find({
            city,
            status: 'upcoming',
            eventDate: { $gte: new Date() }
        })
            .sort({ eventDate: 1 })
            .limit(10);
        // Check which events user has already booked
        const userBookings = await dinnerBooking_model_1.default.find({
            userId,
            bookingStatus: 'confirmed'
        }).select('eventId');
        const bookedEventIds = userBookings.map(b => b.eventId.toString());
        const eventsWithBookingStatus = events.map(event => ({
            id: event._id,
            eventDate: event.eventDate,
            eventTime: event.eventTime,
            city: event.city,
            area: event.area,
            maxAttendees: event.maxAttendees,
            currentAttendees: event.currentAttendees,
            availableSeats: event.maxAttendees - event.currentAttendees,
            bookingFee: event.bookingFee,
            status: event.status,
            isBooked: bookedEventIds.includes(event.id.toString()),
            isFull: event.currentAttendees >= event.maxAttendees
        }));
        return res.json({
            success: true,
            data: {
                events: eventsWithBookingStatus,
                totalEvents: events.length
            }
        });
    }
    catch (error) {
        console.error('Error fetching upcoming events:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch events'
        });
    }
};
exports.getUpcomingEvents = getUpcomingEvents;
// Get event details
const getEventDetails = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.id;
        const event = await dinnerEvent_model_1.default.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        // Check if user has booked this event
        const booking = await dinnerBooking_model_1.default.findOne({
            userId,
            eventId,
            bookingStatus: 'confirmed'
        });
        // Check if venue should be revealed (24 hours before event)
        const now = new Date();
        const eventDateTime = new Date(event.eventDate);
        const hoursUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        const shouldRevealVenue = hoursUntilEvent <= 24 && booking;
        return res.json({
            success: true,
            data: {
                id: event._id,
                eventDate: event.eventDate,
                eventTime: event.eventTime,
                city: event.city,
                area: event.area,
                venue: shouldRevealVenue ? event.venue : null,
                venueAddress: shouldRevealVenue ? event.venueAddress : null,
                venueDetails: shouldRevealVenue ? event.venueDetails : null,
                maxAttendees: event.maxAttendees,
                currentAttendees: event.currentAttendees,
                availableSeats: event.maxAttendees - event.currentAttendees,
                bookingFee: event.bookingFee,
                status: event.status,
                isBooked: !!booking,
                groupChatId: booking ? event.groupChatId : null
            }
        });
    }
    catch (error) {
        console.error('Error fetching event details:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch event details'
        });
    }
};
exports.getEventDetails = getEventDetails;
// Create a new booking (after payment)
const createBooking = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { eventId, paymentId, paymentAmount, paymentMethod, paymentGateway, paymentStatus } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        // Validate required fields
        if (!eventId || !paymentId || !paymentAmount || !paymentMethod || !paymentGateway) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        // Check if event exists and has available seats
        const event = await dinnerEvent_model_1.default.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        if (event.currentAttendees >= event.maxAttendees) {
            return res.status(400).json({
                success: false,
                message: 'Event is full'
            });
        }
        // Check if user already booked this event
        const existingBooking = await dinnerBooking_model_1.default.findOne({
            userId,
            eventId,
            bookingStatus: 'confirmed'
        });
        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'You have already booked this event'
            });
        }
        // Create booking
        // For cash payments, set status as pending; for online payments, set as completed
        const finalPaymentStatus = paymentStatus || (paymentGateway === 'cash' ? 'pending' : 'completed');
        const booking = await dinnerBooking_model_1.default.create({
            userId,
            eventId,
            paymentId,
            paymentStatus: finalPaymentStatus,
            paymentAmount,
            paymentMethod,
            paymentGateway,
            bookingStatus: 'confirmed',
            bookingDate: new Date()
        });
        // Update event attendees
        await dinnerEvent_model_1.default.findByIdAndUpdate(eventId, {
            $inc: { currentAttendees: 1 },
            $push: { attendeeIds: userId },
            $set: {
                status: event.currentAttendees + 1 >= event.maxAttendees ? 'full' : 'upcoming'
            }
        });
        // Get user details for email
        const user = await user_model_1.default.findById(userId);
        // Send booking confirmation email
        if (user && user.email) {
            try {
                console.log('📧 Sending booking confirmation email to:', user.email);
                await (0, bookingEmail_service_1.sendBookingConfirmationEmail)({
                    userName: user.name || user.username || 'Guest',
                    userEmail: user.email,
                    eventDate: event.eventDate.toISOString(),
                    eventTime: event.eventTime,
                    city: event.city,
                    area: event.area,
                    venue: event.venue,
                    venueAddress: event.venueAddress,
                    bookingFee: event.bookingFee,
                    paymentMethod,
                    paymentGateway,
                    paymentStatus: finalPaymentStatus,
                    bookingId: booking.id.toString()
                });
                console.log('✅ Booking confirmation email sent successfully');
            }
            catch (emailError) {
                // Don't fail the booking if email fails
                console.error('❌ Failed to send booking confirmation email:', emailError);
            }
        }
        else {
            console.warn('⚠️ User email not found, skipping confirmation email');
        }
        return res.json({
            success: true,
            message: 'Booking confirmed successfully',
            data: {
                bookingId: booking._id,
                eventId: booking.eventId,
                bookingStatus: booking.bookingStatus,
                bookingDate: booking.bookingDate
            }
        });
    }
    catch (error) {
        console.error('Error creating booking:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create booking'
        });
    }
};
exports.createBooking = createBooking;
// Get user's bookings
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { type } = req.query; // 'upcoming' or 'past'
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const now = new Date();
        const bookings = await dinnerBooking_model_1.default.find({
            userId,
            bookingStatus: { $in: ['confirmed', 'completed'] }
        }).sort({ createdAt: -1 });
        const bookingIds = bookings.map(b => b.eventId);
        const events = await dinnerEvent_model_1.default.find({ _id: { $in: bookingIds } });
        const eventMap = new Map(events.map(e => [e.id.toString(), e]));
        const bookingsWithEvents = bookings
            .map(booking => {
            const event = eventMap.get(booking.eventId.toString());
            if (!event)
                return null;
            const eventDateTime = new Date(event.eventDate);
            const isPast = eventDateTime < now;
            return {
                bookingId: booking._id,
                eventId: event._id,
                eventDate: event.eventDate,
                eventTime: event.eventTime,
                city: event.city,
                area: event.area,
                venue: event.venue,
                venueAddress: event.venueAddress,
                venueDetails: event.venueDetails,
                bookingStatus: booking.bookingStatus,
                bookingDate: booking.bookingDate,
                paymentAmount: booking.paymentAmount,
                paymentMethod: booking.paymentMethod,
                paymentGateway: booking.paymentGateway,
                paymentStatus: booking.paymentStatus,
                paymentId: booking.paymentId,
                maxAttendees: event.maxAttendees,
                currentAttendees: event.currentAttendees,
                bookingFee: event.bookingFee,
                isPast,
                groupChatId: event.groupChatId,
                groupChatCreated: event.groupChatCreated
            };
        })
            .filter((b) => b !== null);
        // Filter based on type
        const filteredBookings = type === 'upcoming'
            ? bookingsWithEvents.filter(b => !b.isPast)
            : type === 'past'
                ? bookingsWithEvents.filter(b => b.isPast)
                : bookingsWithEvents;
        return res.json({
            success: true,
            data: {
                bookings: filteredBookings,
                totalBookings: filteredBookings.length
            }
        });
    }
    catch (error) {
        console.error('Error fetching user bookings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
};
exports.getUserBookings = getUserBookings;

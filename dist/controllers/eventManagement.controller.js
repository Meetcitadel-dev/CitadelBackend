"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventAttendees = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getAllEvents = void 0;
const dinnerEvent_model_1 = __importDefault(require("../models/dinnerEvent.model"));
const dinnerBooking_model_1 = __importDefault(require("../models/dinnerBooking.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
// Get all events (with filters)
const getAllEvents = async (req, res) => {
    try {
        const { status, city, startDate, endDate, page = 1, limit = 20 } = req.query;
        // Build filter query
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (city) {
            filter.city = city;
        }
        if (startDate || endDate) {
            filter.eventDate = {};
            if (startDate) {
                filter.eventDate.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.eventDate.$lte = new Date(endDate);
            }
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [events, totalCount] = await Promise.all([
            dinnerEvent_model_1.default.find(filter)
                .sort({ eventDate: -1 })
                .skip(skip)
                .limit(Number(limit)),
            dinnerEvent_model_1.default.countDocuments(filter)
        ]);
        // Get booking counts for each event
        const eventsWithDetails = await Promise.all(events.map(async (event) => {
            const bookingCount = await dinnerBooking_model_1.default.countDocuments({
                eventId: event._id,
                bookingStatus: 'confirmed'
            });
            return {
                id: event._id,
                eventDate: event.eventDate,
                eventTime: event.eventTime,
                city: event.city,
                area: event.area,
                venue: event.venue,
                venueAddress: event.venueAddress,
                venueDetails: event.venueDetails,
                maxAttendees: event.maxAttendees,
                currentAttendees: event.currentAttendees,
                bookingFee: event.bookingFee,
                status: event.status,
                groupChatId: event.groupChatId,
                groupChatCreated: event.groupChatCreated,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
                confirmedBookings: bookingCount
            };
        }));
        return res.json({
            success: true,
            data: {
                events: eventsWithDetails,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalCount / Number(limit)),
                    totalEvents: totalCount,
                    eventsPerPage: Number(limit)
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching all events:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch events'
        });
    }
};
exports.getAllEvents = getAllEvents;
// Create a new event
const createEvent = async (req, res) => {
    try {
        const { eventDate, eventTime, city, area, venue, venueAddress, venueDetails, maxAttendees, bookingFee } = req.body;
        // Validate required fields
        if (!eventDate || !eventTime || !city || !area || !bookingFee) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: eventDate, eventTime, city, area, bookingFee'
            });
        }
        // Parse and validate date
        const parsedDate = new Date(eventDate);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Please use YYYY-MM-DD format'
            });
        }
        // Create new event
        const newEvent = await dinnerEvent_model_1.default.create({
            eventDate: parsedDate,
            eventTime,
            city,
            area,
            venue: venue || undefined,
            venueAddress: venueAddress || undefined,
            venueDetails: venueDetails || undefined,
            maxAttendees: maxAttendees || 6,
            currentAttendees: 0,
            attendeeIds: [],
            bookingFee,
            status: 'upcoming',
            groupChatCreated: false
        });
        return res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: {
                id: newEvent._id,
                eventDate: newEvent.eventDate,
                eventTime: newEvent.eventTime,
                city: newEvent.city,
                area: newEvent.area,
                venue: newEvent.venue,
                venueAddress: newEvent.venueAddress,
                venueDetails: venueDetails || undefined,
                maxAttendees: newEvent.maxAttendees,
                currentAttendees: newEvent.currentAttendees,
                bookingFee: newEvent.bookingFee,
                status: newEvent.status
            }
        });
    }
    catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create event',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createEvent = createEvent;
// Update an existing event
const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { eventDate, eventTime, city, area, venue, venueAddress, venueDetails, maxAttendees, bookingFee, status } = req.body;
        const event = await dinnerEvent_model_1.default.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        // Validate and update date if provided
        if (eventDate) {
            const parsedDate = new Date(eventDate);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format. Please use YYYY-MM-DD format'
                });
            }
            event.eventDate = parsedDate;
        }
        // Update other fields
        if (eventTime)
            event.eventTime = eventTime;
        if (city)
            event.city = city;
        if (area)
            event.area = area;
        if (venue !== undefined)
            event.venue = venue;
        if (venueAddress !== undefined)
            event.venueAddress = venueAddress;
        if (venueDetails !== undefined)
            event.venueDetails = venueDetails;
        if (maxAttendees !== undefined)
            event.maxAttendees = maxAttendees;
        if (bookingFee !== undefined)
            event.bookingFee = bookingFee;
        if (status)
            event.status = status;
        await event.save();
        return res.json({
            success: true,
            message: 'Event updated successfully',
            data: {
                id: event._id,
                eventDate: event.eventDate,
                eventTime: event.eventTime,
                city: event.city,
                area: event.area,
                venue: event.venue,
                venueAddress: event.venueAddress,
                venueDetails: event.venueDetails,
                maxAttendees: event.maxAttendees,
                currentAttendees: event.currentAttendees,
                bookingFee: event.bookingFee,
                status: event.status
            }
        });
    }
    catch (error) {
        console.error('Error updating event:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update event',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateEvent = updateEvent;
// Delete an event
const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await dinnerEvent_model_1.default.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        // Check if event has bookings
        const bookingCount = await dinnerBooking_model_1.default.countDocuments({
            eventId,
            bookingStatus: 'confirmed'
        });
        if (bookingCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete event with ${bookingCount} confirmed bookings. Cancel the event instead.`
            });
        }
        await dinnerEvent_model_1.default.findByIdAndDelete(eventId);
        return res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting event:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete event'
        });
    }
};
exports.deleteEvent = deleteEvent;
// Get event attendees
const getEventAttendees = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await dinnerEvent_model_1.default.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        // Get all confirmed bookings for this event
        const bookings = await dinnerBooking_model_1.default.find({
            eventId,
            bookingStatus: 'confirmed'
        }).sort({ bookingDate: 1 });
        // Get user details for each booking
        const attendees = await Promise.all(bookings.map(async (booking) => {
            const user = await user_model_1.default.findById(booking.userId).select('name username email phoneNumber');
            return {
                bookingId: booking._id,
                userId: booking.userId,
                userName: (user === null || user === void 0 ? void 0 : user.name) || (user === null || user === void 0 ? void 0 : user.username) || 'Unknown',
                userEmail: user === null || user === void 0 ? void 0 : user.email,
                userPhone: user === null || user === void 0 ? void 0 : user.phoneNumber,
                bookingDate: booking.bookingDate,
                paymentAmount: booking.paymentAmount,
                paymentMethod: booking.paymentMethod,
                paymentGateway: booking.paymentGateway,
                paymentStatus: booking.paymentStatus
            };
        }));
        return res.json({
            success: true,
            data: {
                eventId: event._id,
                eventDate: event.eventDate,
                eventTime: event.eventTime,
                city: event.city,
                area: event.area,
                maxAttendees: event.maxAttendees,
                currentAttendees: event.currentAttendees,
                attendees
            }
        });
    }
    catch (error) {
        console.error('Error fetching event attendees:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch event attendees'
        });
    }
};
exports.getEventAttendees = getEventAttendees;

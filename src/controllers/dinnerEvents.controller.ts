import { Request, Response } from 'express';
import DinnerEvent from '../models/dinnerEvent.model';
import DinnerBooking from '../models/dinnerBooking.model';
import DinnerPreferences from '../models/dinnerPreferences.model';
import Group from '../models/group.model';
import GroupMember from '../models/groupMember.model';
import User from '../models/user.model';
import { sendBookingConfirmationEmail } from '../services/bookingEmail.service';

// Get upcoming dinner events based on user preferences
export const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get user preferences
    const preferences = await DinnerPreferences.findOne({ userId });
    
    const city = preferences?.city || req.query.city as string;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City is required'
      });
    }

    // Get upcoming events for the city
    const events = await DinnerEvent.find({
      city,
      status: 'upcoming',
      eventDate: { $gte: new Date() }
    })
    .sort({ eventDate: 1 })
    .limit(10);

    // Check which events user has already booked
    const userBookings = await DinnerBooking.find({
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
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
};

// Get event details
export const getEventDetails = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user?.id;

    const event = await DinnerEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user has booked this event
    const booking = await DinnerBooking.findOne({
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
  } catch (error) {
    console.error('Error fetching event details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch event details'
    });
  }
};

// Create a new booking (after payment)
export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      eventId,
      paymentId,
      paymentAmount,
      paymentMethod,
      paymentGateway,
      paymentStatus
    } = req.body;

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
    const event = await DinnerEvent.findById(eventId);

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
    const existingBooking = await DinnerBooking.findOne({
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

    const booking = await DinnerBooking.create({
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
    await DinnerEvent.findByIdAndUpdate(eventId, {
      $inc: { currentAttendees: 1 },
      $push: { attendeeIds: userId },
      $set: {
        status: event.currentAttendees + 1 >= event.maxAttendees ? 'full' : 'upcoming'
      }
    });

    // Get user details for email
    const user = await User.findById(userId);

    // Send booking confirmation email
    if (user && user.email) {
      try {
        console.log('📧 Sending booking confirmation email to:', user.email);

        await sendBookingConfirmationEmail({
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
      } catch (emailError) {
        // Don't fail the booking if email fails
        console.error('❌ Failed to send booking confirmation email:', emailError);
      }
    } else {
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
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
};

// Get user's bookings
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { type } = req.query; // 'upcoming' or 'past'

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const now = new Date();

    const bookings = await DinnerBooking.find({
      userId,
      bookingStatus: { $in: ['confirmed', 'completed'] }
    }).sort({ createdAt: -1 });

    const bookingIds = bookings.map(b => b.eventId);
    const events = await DinnerEvent.find({ _id: { $in: bookingIds } });

    const eventMap = new Map(events.map(e => [e.id.toString(), e]));

    type BookingWithEvent = {
      bookingId: any;
      eventId: any;
      eventDate: any;
      eventTime: any;
      city: string;
      area: string;
      venue: any;
      venueAddress: any;
      venueDetails: any;
      bookingStatus: string;
      bookingDate: Date;
      paymentAmount: number;
      paymentMethod: string;
      paymentGateway: string;
      paymentStatus: string;
      paymentId: string;
      maxAttendees: number;
      currentAttendees: number;
      bookingFee: number;
      isPast: boolean;
      groupChatId: any;
      groupChatCreated: any;
    };

    const bookingsWithEvents: BookingWithEvent[] = bookings
      .map<BookingWithEvent | null>(booking => {
        const event = eventMap.get(booking.eventId.toString());
        if (!event) return null;

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
      .filter((b): b is BookingWithEvent => b !== null);

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
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};


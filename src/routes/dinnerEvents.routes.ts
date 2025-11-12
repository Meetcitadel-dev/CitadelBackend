import express from 'express';
import {
  getUpcomingEvents,
  getEventDetails,
  createBooking,
  getUserBookings
} from '../controllers/dinnerEvents.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

// Public route - Get upcoming dinner events (no auth required for viewing)
router.get('/upcoming', getUpcomingEvents);

// Protected routes - require authentication
router.use(authenticateToken);

// Get event details
router.get('/:eventId', getEventDetails);

// Create a booking (after payment)
router.post('/bookings', createBooking);

// Get user's bookings
router.get('/bookings/my', getUserBookings);

export default router;


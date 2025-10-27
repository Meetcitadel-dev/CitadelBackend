import express from 'express';
import {
  getUpcomingEvents,
  getEventDetails,
  createBooking,
  getUserBookings
} from '../controllers/dinnerEvents.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get upcoming dinner events
router.get('/upcoming', getUpcomingEvents);

// Get event details
router.get('/:eventId', getEventDetails);

// Create a booking (after payment)
router.post('/bookings', createBooking);

// Get user's bookings
router.get('/bookings/my', getUserBookings);

export default router;


import express from 'express';
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAttendees
} from '../controllers/eventManagement.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all events with filters
router.get('/', getAllEvents);

// Create a new event
router.post('/', createEvent);

// Update an event
router.put('/:eventId', updateEvent);

// Delete an event
router.delete('/:eventId', deleteEvent);

// Get event attendees
router.get('/:eventId/attendees', getEventAttendees);

export default router;


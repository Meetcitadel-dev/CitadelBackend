import { Router } from 'express';
import paymentController from '../controllers/payment.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/create-order', paymentController.createOrder);
router.post('/create-phonepe-order', paymentController.createPhonePeOrder);
router.post('/verify', paymentController.verifyPayment);

// Protected routes (require authentication)
router.get('/booking/:bookingId', authenticateToken, paymentController.getBooking);
router.get('/user/:userId/bookings', authenticateToken, paymentController.getUserBookings);
router.get('/events', paymentController.getEvents);
router.post('/events', authenticateToken, paymentController.createEvent);

export default router; 
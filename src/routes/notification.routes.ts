import { Router } from 'express';
import { getNotifications, handleConnectionRequest, markNotificationAsRead } from '../controllers/notification.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Get all notifications for the authenticated user
router.get('/notifications', authenticateToken, getNotifications);

// Handle connection request (accept/reject)
router.post('/notifications/connection-request', authenticateToken, handleConnectionRequest);

// Mark notification as read
router.post('/notifications/:notificationId/read', authenticateToken, markNotificationAsRead);

export default router;
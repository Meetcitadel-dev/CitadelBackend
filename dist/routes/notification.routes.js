"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Get all notifications for the authenticated user
router.get('/notifications', auth_middleware_1.authenticateToken, notification_controller_1.getNotifications);
// Handle connection request (accept/reject)
router.post('/notifications/connection-request', auth_middleware_1.authenticateToken, notification_controller_1.handleConnectionRequest);
// Mark notification as read
router.post('/notifications/:notificationId/read', auth_middleware_1.authenticateToken, notification_controller_1.markNotificationAsRead);
exports.default = router;

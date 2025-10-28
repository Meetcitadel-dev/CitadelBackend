"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = __importDefault(require("../controllers/payment.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/create-order', payment_controller_1.default.createOrder);
router.post('/create-phonepe-order', payment_controller_1.default.createPhonePeOrder);
router.post('/create-cash-payment', payment_controller_1.default.createCashPayment);
router.post('/verify', payment_controller_1.default.verifyPayment);
// Protected routes (require authentication)
router.get('/booking/:bookingId', auth_middleware_1.authenticateToken, payment_controller_1.default.getBooking);
router.get('/user/:userId/bookings', auth_middleware_1.authenticateToken, payment_controller_1.default.getUserBookings);
router.get('/events', payment_controller_1.default.getEvents);
router.post('/events', auth_middleware_1.authenticateToken, payment_controller_1.default.createEvent);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dinnerEvents_controller_1 = require("../controllers/dinnerEvents.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Public route - Get upcoming dinner events (no auth required for viewing)
router.get('/upcoming', dinnerEvents_controller_1.getUpcomingEvents);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticateToken);
// Get event details
router.get('/:eventId', dinnerEvents_controller_1.getEventDetails);
// Create a booking (after payment)
router.post('/bookings', dinnerEvents_controller_1.createBooking);
// Get user's bookings
router.get('/bookings/my', dinnerEvents_controller_1.getUserBookings);
exports.default = router;

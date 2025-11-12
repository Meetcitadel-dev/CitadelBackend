"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const eventManagement_controller_1 = require("../controllers/eventManagement.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authenticateToken);
// Get all events with filters
router.get('/', eventManagement_controller_1.getAllEvents);
// Create a new event
router.post('/', eventManagement_controller_1.createEvent);
// Update an event
router.put('/:eventId', eventManagement_controller_1.updateEvent);
// Delete an event
router.delete('/:eventId', eventManagement_controller_1.deleteEvent);
// Get event attendees
router.get('/:eventId/attendees', eventManagement_controller_1.getEventAttendees);
exports.default = router;

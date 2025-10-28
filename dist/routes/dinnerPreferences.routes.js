"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dinnerPreferences_controller_1 = require("../controllers/dinnerPreferences.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authenticateToken);
// Get user's dinner preferences
router.get('/', dinnerPreferences_controller_1.getDinnerPreferences);
// Save initial setup preferences
router.post('/initial', dinnerPreferences_controller_1.saveInitialPreferences);
// Get personality quiz questions
router.get('/personality-quiz', dinnerPreferences_controller_1.getPersonalityQuizQuestions);
// Submit personality quiz answers
router.post('/personality-quiz', dinnerPreferences_controller_1.submitPersonalityQuiz);
// Update dinner preferences
router.patch('/', dinnerPreferences_controller_1.updateDinnerPreferences);
exports.default = router;

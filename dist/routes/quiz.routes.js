"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quiz_controller_1 = require("../controllers/quiz.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Get quiz questions for new user (no auth required)
router.get('/questions', quiz_controller_1.getQuizQuestions);
// Submit quiz answers
router.post('/submit', auth_middleware_1.authenticateToken, quiz_controller_1.submitQuizAnswers);
// Get user's quiz results
router.get('/results', auth_middleware_1.authenticateToken, quiz_controller_1.getQuizResults);
exports.default = router;

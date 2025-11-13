"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quiz_controller_1 = require("../controllers/quiz.controller");
const router = express_1.default.Router();
// Create a new personality quiz
router.post('/', quiz_controller_1.createQuiz);
// Get all personality quizzes
router.get('/', quiz_controller_1.getQuiz);
// Submit personality quiz answers
router.post('/submit', quiz_controller_1.submitQuiz);
exports.default = router;

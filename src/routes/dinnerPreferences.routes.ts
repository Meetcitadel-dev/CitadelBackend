import express from 'express';
import {
  getDinnerPreferences,
  saveInitialPreferences,
  getPersonalityQuizQuestions,
  submitPersonalityQuiz,
  updateDinnerPreferences
} from '../controllers/dinnerPreferences.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's dinner preferences
router.get('/', getDinnerPreferences);

// Save initial setup preferences
router.post('/initial', saveInitialPreferences);

// Get personality quiz questions
router.get('/personality-quiz', getPersonalityQuizQuestions);

// Submit personality quiz answers
router.post('/personality-quiz', submitPersonalityQuiz);

// Update dinner preferences
router.patch('/', updateDinnerPreferences);

export default router;


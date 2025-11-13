import express from 'express';
import { 
  getQuizQuestions, 
  submitQuizAnswers, 
  getQuizResults
} from '../controllers/quiz.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

// Get quiz questions for new user (no auth required)
router.get('/questions', getQuizQuestions);

// Submit quiz answers
router.post('/submit', authenticateToken, submitQuizAnswers);

// Get user's quiz results
router.get('/results', authenticateToken, getQuizResults);

export default router;

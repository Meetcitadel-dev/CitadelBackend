import express from 'express';
import { 
  createQuiz,
  getQuiz,
  submitQuiz
} from '../controllers/quiz.controller';

const router = express.Router();

// Create a new personality quiz
router.post('/', createQuiz);

// Get all personality quizzes
router.get('/', getQuiz);

// Submit personality quiz answers
router.post('/submit', submitQuiz);

export default router;


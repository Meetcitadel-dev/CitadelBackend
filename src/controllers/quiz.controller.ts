import { Request, Response } from 'express';
import Quiz from '../models/quiz.model';
import QuizResponse from '../models/quizResponse.model';
import User from '../models/user.model';

// Get quiz questions for a new user (no authentication required)
export const getQuizQuestions = async (req: Request, res: Response) => {
  try {
    // No authentication required for getting quiz questions
    // This allows new users to take the quiz before signing up

    // Get 10 random questions from different categories
    const questions = await Quiz.aggregate([
      { $sample: { size: 10 } }
    ]);

    // Remove correct answers from response
    const sanitizedQuestions = questions.map(q => ({
      id: q._id,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty
    }));

    res.json({
      success: true,
      data: {
        questions: sanitizedQuestions,
        totalQuestions: sanitizedQuestions.length
      }
    });
  } catch (error) {
    console.error('Error getting quiz questions:', error);
    res.status(500).json({ error: 'Failed to get quiz questions' });
  }
};

// Submit quiz answers
export const submitQuizAnswers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { answers } = req.body; // Array of { quizId, selectedAnswer, timeSpent }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    // Get all quiz questions to verify answers
    const quizIds = answers.map(a => a.quizId);
    const quizzes = await Quiz.find({ _id: { $in: quizIds } });
    const quizMap = new Map(quizzes.map((q: any) => [q._id.toString(), q]));

    let totalPoints = 0;
    let correctAnswers = 0;
    const responses = [
      
    ];

    // Process each answer
    for (const answer of answers) {
      const quiz = quizMap.get(answer.quizId);
      if (!quiz) continue;

      const isCorrect = answer.selectedAnswer === quiz.correctAnswer;
      const points = isCorrect ? quiz.points : 0;
      
      totalPoints += points;
      if (isCorrect) correctAnswers++;

      // Save response
      const response = new QuizResponse({
        userId,
        quizId: answer.quizId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        points,
        timeSpent: answer.timeSpent || 0
      });
      
      responses.push(response);
    }

    // Save all responses
    await QuizResponse.insertMany(responses);

    // Update user's quiz completion status
    await User.findByIdAndUpdate(userId, {
      hasCompletedQuiz: true,
      quizScore: totalPoints,
      quizCompletedAt: new Date()
    });

    const percentage = Math.round((correctAnswers / answers.length) * 100);

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        totalQuestions: answers.length,
        correctAnswers,
        totalPoints,
        percentage,
        responses: responses.length
      }
    });
  } catch (error) {
    console.error('Error submitting quiz answers:', error);
    res.status(500).json({ error: 'Failed to submit quiz answers' });
  }
};

// Get user's quiz results
export const getQuizResults = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.hasCompletedQuiz) {
      return res.status(200).json({
        success: true,
        data: {
          hasCompletedQuiz: false,
          quizScore: 0,
          quizCompletedAt: null,
          responses: []
        }
      });
    }

    // Get detailed responses
    const responses = await QuizResponse.find({ userId })
      .populate('quizId', 'question category difficulty')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: {
        hasCompletedQuiz: user.hasCompletedQuiz,
        quizScore: user.quizScore,
        quizCompletedAt: user.quizCompletedAt,
        responses: responses.map(r => ({
          question: r.quizId,
          selectedAnswer: r.selectedAnswer,
          isCorrect: r.isCorrect,
          points: r.points,
          timeSpent: r.timeSpent
        }))
      }
    });
  } catch (error) {
    console.error('Error getting quiz results:', error);
    res.status(500).json({ error: 'Failed to get quiz results' });
  }
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuiz = exports.getQuiz = exports.createQuiz = exports.getQuizResults = exports.submitQuizAnswers = exports.getQuizQuestions = void 0;
const quiz_model_1 = __importDefault(require("../models/quiz.model"));
const quizResponse_model_1 = __importDefault(require("../models/quizResponse.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const personalityQuizSet_model_1 = __importDefault(require("../models/personalityQuizSet.model"));
const personalityQuizSubmission_model_1 = __importDefault(require("../models/personalityQuizSubmission.model"));
// Get quiz questions for a new user (no authentication required)
const getQuizQuestions = async (req, res) => {
    try {
        // No authentication required for getting quiz questions
        // This allows new users to take the quiz before signing up
        // Get 10 random questions from different categories
        const questions = await quiz_model_1.default.aggregate([
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
    }
    catch (error) {
        console.error('Error getting quiz questions:', error);
        res.status(500).json({ error: 'Failed to get quiz questions' });
    }
};
exports.getQuizQuestions = getQuizQuestions;
// Submit quiz answers
const submitQuizAnswers = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { answers } = req.body; // Array of { quizId, selectedAnswer, timeSpent }
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Answers array is required' });
        }
        // Get all quiz questions to verify answers
        const quizIds = answers.map(a => a.quizId);
        const quizzes = await quiz_model_1.default.find({ _id: { $in: quizIds } });
        const quizMap = new Map(quizzes.map((q) => [q._id.toString(), q]));
        let totalPoints = 0;
        let correctAnswers = 0;
        const responses = [];
        // Process each answer
        for (const answer of answers) {
            const quiz = quizMap.get(answer.quizId);
            if (!quiz)
                continue;
            const isCorrect = answer.selectedAnswer === quiz.correctAnswer;
            const points = isCorrect ? quiz.points : 0;
            totalPoints += points;
            if (isCorrect)
                correctAnswers++;
            // Save response
            const response = new quizResponse_model_1.default({
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
        await quizResponse_model_1.default.insertMany(responses);
        // Update user's quiz completion status
        await user_model_1.default.findByIdAndUpdate(userId, {
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
    }
    catch (error) {
        console.error('Error submitting quiz answers:', error);
        res.status(500).json({ error: 'Failed to submit quiz answers' });
    }
};
exports.submitQuizAnswers = submitQuizAnswers;
// Get user's quiz results
const getQuizResults = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await user_model_1.default.findById(userId);
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
        const responses = await quizResponse_model_1.default.find({ userId })
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
    }
    catch (error) {
        console.error('Error getting quiz results:', error);
        res.status(500).json({ error: 'Failed to get quiz results' });
    }
};
exports.getQuizResults = getQuizResults;
// ==================== PERSONALITY QUIZ ENDPOINTS ====================
// Create a new personality quiz
const createQuiz = async (req, res) => {
    try {
        const { title, questions } = req.body;
        // Validation
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Title is required and must be a non-empty string'
            });
        }
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Questions array is required and must contain at least one question'
            });
        }
        // Validate each question
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: `Question ${i + 1}: question text is required`
                });
            }
            // Accept both old and new type formats
            const validTypes = ['yes-no', 'multiple-choice', 'scale', 'text', 'yesno', 'choice', 'rating', 'input'];
            if (!q.type || !validTypes.includes(q.type)) {
                return res.status(400).json({
                    success: false,
                    error: `Question ${i + 1}: type must be one of: yes-no, multiple-choice, scale, text, yesno, choice, rating, input`
                });
            }
            // For multiple-choice/choice questions, options are required
            if (q.type === 'multiple-choice' || q.type === 'choice') {
                if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: `Question ${i + 1}: options array is required for ${q.type} questions`
                    });
                }
            }
        }
        // Helper function to normalize question types
        const normalizeType = (type) => {
            const typeMap = {
                'yesno': 'yes-no',
                'choice': 'multiple-choice',
                'rating': 'scale'
            };
            return typeMap[type] || type;
        };
        // Create the quiz
        const quiz = new personalityQuizSet_model_1.default({
            title: title.trim(),
            questions: questions.map((q) => ({
                question: q.question.trim(),
                type: normalizeType(q.type), // Normalize to standard format
                options: q.options ? q.options.map((opt) => opt.trim()) : undefined
            }))
        });
        await quiz.save();
        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            data: {
                id: quiz._id,
                title: quiz.title,
                questions: quiz.questions,
                totalQuestions: quiz.questions.length,
                createdAt: quiz.createdAt
            }
        });
    }
    catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create quiz'
        });
    }
};
exports.createQuiz = createQuiz;
// Get all personality quizzes
const getQuiz = async (req, res) => {
    try {
        const quizzes = await personalityQuizSet_model_1.default.find()
            .sort({ createdAt: -1 })
            .select('-__v');
        res.json({
            success: true,
            message: 'Quizzes fetched successfully',
            data: {
                quizzes: quizzes.map(quiz => ({
                    id: quiz._id,
                    title: quiz.title,
                    questions: quiz.questions,
                    totalQuestions: quiz.questions.length,
                    createdAt: quiz.createdAt,
                    updatedAt: quiz.updatedAt
                })),
                totalQuizzes: quizzes.length
            }
        });
    }
    catch (error) {
        console.error('Error getting quizzes:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get quizzes'
        });
    }
};
exports.getQuiz = getQuiz;
// Submit quiz answers
const submitQuiz = async (req, res) => {
    try {
        const { quizId, userName, answers } = req.body;
        // Validation
        if (!quizId) {
            return res.status(400).json({
                success: false,
                error: 'quizId is required'
            });
        }
        if (!userName || typeof userName !== 'string' || userName.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'userName is required and must be a non-empty string'
            });
        }
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Answers array is required and must contain at least one answer'
            });
        }
        // Verify quiz exists
        const quiz = await personalityQuizSet_model_1.default.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found'
            });
        }
        // Validate answers match questions
        if (answers.length !== quiz.questions.length) {
            return res.status(400).json({
                success: false,
                error: `Expected ${quiz.questions.length} answers, but received ${answers.length}`
            });
        }
        // Validate each answer
        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i];
            const question = quiz.questions[i];
            if (!answer.question || answer.question.trim() !== question.question.trim()) {
                return res.status(400).json({
                    success: false,
                    error: `Answer ${i + 1}: question text does not match the quiz question`
                });
            }
            if (answer.answer === undefined || answer.answer === null || answer.answer === '') {
                return res.status(400).json({
                    success: false,
                    error: `Answer ${i + 1}: answer is required`
                });
            }
            // Validate answer type based on question type (handle both old and new formats)
            const questionType = question.type;
            if (questionType === 'yes-no' || questionType === 'yesno') {
                if (typeof answer.answer !== 'string' || !['Yes', 'No', 'yes', 'no'].includes(answer.answer)) {
                    return res.status(400).json({
                        success: false,
                        error: `Answer ${i + 1}: answer must be "Yes" or "No" for yes-no/yesno questions`
                    });
                }
            }
            else if (questionType === 'scale' || questionType === 'rating') {
                // Accept both number and string format for rating
                const numAnswer = typeof answer.answer === 'string' ? Number(answer.answer) : Number(answer.answer);
                if (isNaN(numAnswer) || numAnswer < 1 || numAnswer > 10 || !Number.isInteger(numAnswer)) {
                    return res.status(400).json({
                        success: false,
                        error: `Answer ${i + 1}: answer must be an integer between 1 and 10 for scale/rating questions`
                    });
                }
            }
            else if (questionType === 'multiple-choice' || questionType === 'choice') {
                if (!question.options || !question.options.includes(answer.answer)) {
                    return res.status(400).json({
                        success: false,
                        error: `Answer ${i + 1}: answer must be one of the provided options`
                    });
                }
            }
        }
        // Create submission
        const submission = new personalityQuizSubmission_model_1.default({
            quizId,
            userName: userName.trim(),
            answers: answers.map((a, index) => {
                const question = quiz.questions[index];
                const questionType = question.type;
                // Convert rating/scale answers to numbers
                const normalizedAnswer = (questionType === 'scale' || questionType === 'rating')
                    ? Number(a.answer)
                    : a.answer;
                return {
                    question: a.question.trim(),
                    answer: normalizedAnswer
                };
            })
        });
        await submission.save();
        // Populate quiz details for response
        await submission.populate('quizId', 'title questions');
        res.status(201).json({
            success: true,
            message: 'Quiz submitted successfully',
            data: {
                id: submission._id,
                quizId: submission.quizId,
                userName: submission.userName,
                answers: submission.answers,
                totalAnswers: submission.answers.length,
                submittedAt: submission.submittedAt
            }
        });
    }
    catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to submit quiz'
        });
    }
};
exports.submitQuiz = submitQuiz;

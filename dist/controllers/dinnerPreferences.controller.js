"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDinnerPreferences = exports.submitPersonalityQuiz = exports.getPersonalityQuizQuestions = exports.saveInitialPreferences = exports.getDinnerPreferences = void 0;
const dinnerPreferences_model_1 = __importDefault(require("../models/dinnerPreferences.model"));
const personalityQuiz_model_1 = __importDefault(require("../models/personalityQuiz.model"));
// Get user's dinner preferences
const getDinnerPreferences = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const preferences = await dinnerPreferences_model_1.default.findOne({ userId });
        if (!preferences) {
            return res.json({
                success: true,
                data: {
                    hasCompletedSetup: false,
                    preferences: null
                }
            });
        }
        return res.json({
            success: true,
            data: {
                hasCompletedSetup: preferences.hasCompletedSetup,
                preferences: {
                    city: preferences.city,
                    preferredAreas: preferences.preferredAreas,
                    budget: preferences.budget,
                    language: preferences.language,
                    dietaryRestriction: preferences.dietaryRestriction,
                    drinksPreference: preferences.drinksPreference,
                    relationshipStatus: preferences.relationshipStatus,
                    personalityScore: preferences.personalityScore,
                    setupCompletedAt: preferences.setupCompletedAt
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching dinner preferences:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch preferences'
        });
    }
};
exports.getDinnerPreferences = getDinnerPreferences;
// Save initial setup preferences (city, areas, budget, etc.)
const saveInitialPreferences = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { city, preferredAreas, budget, language, dietaryRestriction, drinksPreference, relationshipStatus } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        // Validate required fields
        if (!city || !preferredAreas || !budget || !language || !dietaryRestriction) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        // Update or create preferences
        const preferences = await dinnerPreferences_model_1.default.findOneAndUpdate({ userId }, {
            userId,
            city,
            preferredAreas,
            budget,
            language,
            dietaryRestriction,
            drinksPreference,
            relationshipStatus
        }, { upsert: true, new: true });
        return res.json({
            success: true,
            message: 'Initial preferences saved successfully',
            data: preferences
        });
    }
    catch (error) {
        console.error('Error saving initial preferences:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save preferences'
        });
    }
};
exports.saveInitialPreferences = saveInitialPreferences;
// Get personality quiz questions
const getPersonalityQuizQuestions = async (req, res) => {
    try {
        const questions = await personalityQuiz_model_1.default.find({ isActive: true })
            .sort({ order: 1 })
            .limit(10);
        return res.json({
            success: true,
            data: {
                questions: questions.map(q => ({
                    questionId: q.questionId,
                    question: q.question,
                    options: q.options,
                    category: q.category
                })),
                totalQuestions: questions.length
            }
        });
    }
    catch (error) {
        console.error('Error fetching personality quiz questions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch quiz questions'
        });
    }
};
exports.getPersonalityQuizQuestions = getPersonalityQuizQuestions;
// Submit personality quiz answers
const submitPersonalityQuiz = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { answers } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid answers format'
            });
        }
        // Calculate personality score (simple scoring for now)
        const personalityScore = Math.floor(Math.random() * 30) + 70; // 70-100
        // Update preferences with quiz results
        const preferences = await dinnerPreferences_model_1.default.findOneAndUpdate({ userId }, {
            personalityTraits: answers,
            personalityScore,
            hasCompletedSetup: true,
            setupCompletedAt: new Date()
        }, { new: true });
        if (!preferences) {
            return res.status(404).json({
                success: false,
                message: 'Preferences not found. Please complete initial setup first.'
            });
        }
        return res.json({
            success: true,
            message: 'Personality quiz completed successfully',
            data: {
                personalityScore,
                hasCompletedSetup: true
            }
        });
    }
    catch (error) {
        console.error('Error submitting personality quiz:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit quiz'
        });
    }
};
exports.submitPersonalityQuiz = submitPersonalityQuiz;
// Update dinner preferences
const updateDinnerPreferences = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const updates = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const preferences = await dinnerPreferences_model_1.default.findOneAndUpdate({ userId }, { $set: updates }, { new: true });
        if (!preferences) {
            return res.status(404).json({
                success: false,
                message: 'Preferences not found'
            });
        }
        return res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: preferences
        });
    }
    catch (error) {
        console.error('Error updating preferences:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update preferences'
        });
    }
};
exports.updateDinnerPreferences = updateDinnerPreferences;

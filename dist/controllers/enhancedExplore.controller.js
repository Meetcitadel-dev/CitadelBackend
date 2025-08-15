"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const connection_model_1 = __importDefault(require("../models/connection.model"));
const adjectiveSelection_model_1 = __importDefault(require("../models/adjectiveSelection.model"));
const match_model_1 = __importDefault(require("../models/match.model"));
const sequelize_1 = require("sequelize");
// Gender-based adjective pools
const MALE_ADJECTIVES = [
    'Handsome', 'Strong', 'Brave', 'Confident', 'Loyal', 'Reliable', 'Honest',
    'Hardworking', 'Protective', 'Respectful', 'Determined', 'Disciplined',
    'Steadfast', 'Courageous', 'Thoughtful', 'Dutiful', 'Gallant', 'Steady',
    'Vigilant', 'Tough', 'Sincere', 'Decisive', 'Witty', 'Daring', 'Honorable'
];
const FEMALE_ADJECTIVES = [
    'Beautiful', 'Graceful', 'Kind', 'Caring', 'Elegant', 'Nurturing', 'Gentle',
    'Compassionate', 'Radiant', 'Warm', 'Empathetic', 'Intuitive', 'Joyful',
    'Poised', 'Articulate', 'Persistent', 'Loving', 'Cheerful', 'Vibrant',
    'Serene', 'Lovable', 'Bright', 'Charming', 'Gracious', 'Selfless'
];
const GENDER_NEUTRAL_ADJECTIVES = [
    'Smart', 'Funny', 'Friendly', 'Creative', 'Optimistic', 'Organized',
    'Adaptable', 'Generous', 'Passionate', 'Enthusiastic', 'Curious', 'Mindful',
    'Innovative', 'Dedicated', 'Resourceful', 'Practical', 'Genuine',
    'Considerate', 'Collaborative', 'Resilient', 'Open-minded', 'Level-headed',
    'Ambitious', 'Analytical', 'Patient'
];
// Year mapping from frontend to database values
const YEAR_MAPPING = {
    'First': '1st',
    'Second': '2nd',
    'Third': '3rd',
    'Fourth': '4th',
    '1st': '1st',
    '2nd': '2nd',
    '3rd': '3rd',
    '4th': '4th'
};
// Ice-breaking prompts based on adjectives
const ICE_BREAKING_PROMPTS = {
    'Smart': "You both find each other smart! 🧠 What's the most interesting thing you've learned recently?",
    'Funny': "You both find each other funny! 😄 What's your favorite joke or funny story?",
    'Creative': "You both find each other creative! 🎨 What's your favorite way to express creativity?",
    'Kind': "You both find each other kind! ❤️ What's the nicest thing someone has done for you?",
    'Ambitious': "You both find each other ambitious! 🚀 What's your biggest goal right now?",
    'Adventurous': "You both find each other adventurous! 🌍 What's the most exciting place you've visited?",
    'Reliable': "You both find each other reliable! 🤝 What makes someone trustworthy in your eyes?",
    'Witty': "You both find each other witty! 😏 What's your best comeback or clever response?",
    'Thoughtful': "You both find each other thoughtful! 🤔 What's something you've been reflecting on lately?",
    'Bold': "You both find each other bold! 💪 What's the bravest thing you've ever done?",
    'Genuine': "You both find each other genuine! ✨ What's something authentic about yourself?",
    'Energetic': "You both find each other energetic! ⚡ What gets you most excited?",
    'Calm': "You both find each other calm! 🧘 What helps you stay peaceful?",
    'Inspiring': "You both find each other inspiring! 🌟 What motivates you the most?",
    'Curious': "You both find each other curious! 🔍 What's something you're eager to learn about?",
    'Intelligent': "You both find each other intelligent! 🧠 What's a topic you could talk about for hours?"
};
// Get appropriate adjectives based on gender combination
const getAdjectivesForGender = (viewerGender, targetGender) => {
    if (viewerGender === targetGender) {
        // Same gender: show gender-specific + neutral adjectives
        const genderSpecific = viewerGender === 'Male' ? MALE_ADJECTIVES : FEMALE_ADJECTIVES;
        return [...genderSpecific, ...GENDER_NEUTRAL_ADJECTIVES];
    }
    else {
        // Different gender: show only neutral adjectives
        return GENDER_NEUTRAL_ADJECTIVES;
    }
};
// Generate ice-breaking prompt
const generateIceBreakingPrompt = (adjective) => {
    return ICE_BREAKING_PROMPTS[adjective] || `You both find each other ${adjective.toLowerCase()}! 💫 What's something you'd like to know about each other?`;
};
// Get user's gender
const getUserGender = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const user = await user_model_1.default.findByPk(currentUserId, {
            attributes: ['gender']
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({
            success: true,
            gender: user.gender || 'Other',
            message: 'User gender retrieved successfully'
        });
    }
    catch (error) {
        console.error('Error getting user gender:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Get adjective selections for a user
const getAdjectiveSelections = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.user.id;
        if (!targetUserId) {
            res.status(400).json({ success: false, message: 'Target user ID is required' });
            return;
        }
        const selections = await adjectiveSelection_model_1.default.findAll({
            where: {
                userId: currentUserId,
                targetUserId: parseInt(targetUserId)
            },
            attributes: ['id', 'userId', 'targetUserId', 'adjective', 'timestamp', 'isMatched'],
            order: [['timestamp', 'DESC']]
        });
        res.json({
            success: true,
            selections: selections.map(selection => ({
                id: selection.id,
                userId: selection.userId,
                targetUserId: selection.targetUserId,
                adjective: selection.adjective,
                timestamp: selection.timestamp,
                isMatched: selection.isMatched
            })),
            message: 'Adjective selections retrieved successfully'
        });
    }
    catch (error) {
        console.error('Error getting adjective selections:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Enhanced adjective selection with gender-based filtering
const selectAdjective = async (req, res) => {
    try {
        const { targetUserId, adjective } = req.body;
        const currentUserId = req.user.id;
        if (!targetUserId || !adjective) {
            res.status(400).json({ success: false, message: 'Missing required parameters' });
            return;
        }
        // Get current user and target user for gender validation
        const [currentUser, targetUser] = await Promise.all([
            user_model_1.default.findByPk(currentUserId, { attributes: ['gender'] }),
            user_model_1.default.findByPk(targetUserId, { attributes: ['gender'] })
        ]);
        if (!currentUser || !targetUser) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        // Get allowed adjectives based on gender combination
        const allowedAdjectives = getAdjectivesForGender(currentUser.gender || 'Other', targetUser.gender || 'Other');
        if (!allowedAdjectives.includes(adjective)) {
            res.status(400).json({ success: false, message: 'Invalid adjective for this gender combination' });
            return;
        }
        // Check if user has already selected an adjective for this target
        const existingSelection = await adjectiveSelection_model_1.default.findOne({
            where: {
                userId: currentUserId,
                targetUserId: parseInt(targetUserId)
            }
        });
        let selection;
        let isUpdate = false;
        if (existingSelection) {
            // Update existing selection
            await existingSelection.update({
                adjective,
                timestamp: new Date(),
                isMatched: false // Reset match status since adjective changed
            });
            selection = existingSelection;
            isUpdate = true;
        }
        else {
            // Create new adjective selection
            selection = await adjectiveSelection_model_1.default.create({
                userId: currentUserId,
                targetUserId: parseInt(targetUserId),
                adjective,
                timestamp: new Date(),
                isMatched: false
            });
        }
        // Check for mutual match
        const mutualSelection = await adjectiveSelection_model_1.default.findOne({
            where: {
                userId: parseInt(targetUserId),
                targetUserId: currentUserId,
                adjective
            }
        });
        let matched = false;
        let matchData = null;
        if (mutualSelection) {
            // Create match
            const match = await match_model_1.default.create({
                userId1: Math.min(currentUserId, parseInt(targetUserId)),
                userId2: Math.max(currentUserId, parseInt(targetUserId)),
                mutualAdjective: adjective,
                isConnected: false,
                matchTimestamp: new Date(),
                iceBreakingPrompt: generateIceBreakingPrompt(adjective)
            });
            // Update both selections as matched
            await selection.update({ isMatched: true });
            await mutualSelection.update({ isMatched: true });
            matched = true;
            matchData = {
                id: match.id,
                userId1: match.userId1,
                userId2: match.userId2,
                mutualAdjective: match.mutualAdjective,
                matchTimestamp: match.matchTimestamp
            };
        }
        res.json({
            success: true,
            matched,
            matchData,
            isUpdate,
            previousAdjective: isUpdate ? existingSelection.adjective : null
        });
    }
    catch (error) {
        console.error('Error selecting adjective:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Get match state between two users
const getMatchState = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.user.id;
        if (!targetUserId) {
            res.status(400).json({ success: false, message: 'Target user ID is required' });
            return;
        }
        const match = await match_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: currentUserId, userId2: parseInt(targetUserId) },
                    { userId1: parseInt(targetUserId), userId2: currentUserId }
                ]
            }
        });
        if (!match) {
            res.json({
                success: true,
                matchState: null,
                message: 'No match found'
            });
            return;
        }
        // Check actual connection status from Connection table
        const connection = await connection_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: currentUserId, userId2: parseInt(targetUserId) },
                    { userId1: parseInt(targetUserId), userId2: currentUserId }
                ],
                status: 'connected'
            }
        });
        res.json({
            success: true,
            matchState: {
                id: match.id,
                userId1: match.userId1,
                userId2: match.userId2,
                mutualAdjective: match.mutualAdjective,
                isConnected: !!connection, // Use actual connection status
                matchTimestamp: match.matchTimestamp,
                connectionTimestamp: connection?.createdAt || null,
                iceBreakingPrompt: match.iceBreakingPrompt
            },
            message: 'Match state retrieved successfully'
        });
    }
    catch (error) {
        console.error('Error getting match state:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Connect after match
const connectAfterMatch = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user.id;
        if (!targetUserId) {
            res.status(400).json({ success: false, message: 'Target user ID is required' });
            return;
        }
        // Find the match
        const match = await match_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: currentUserId, userId2: parseInt(targetUserId) },
                    { userId1: parseInt(targetUserId), userId2: currentUserId }
                ]
            }
        });
        if (!match) {
            res.status(404).json({ success: false, message: 'No match found' });
            return;
        }
        if (match.isConnected) {
            res.status(400).json({ success: false, message: 'Already connected' });
            return;
        }
        // Update match as connected
        await match.update({
            isConnected: true,
            connectionTimestamp: new Date()
        });
        // Create or update connection
        const [connection, created] = await connection_model_1.default.findOrCreate({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: currentUserId, userId2: parseInt(targetUserId) },
                    { userId1: parseInt(targetUserId), userId2: currentUserId }
                ]
            },
            defaults: {
                userId1: Math.min(currentUserId, parseInt(targetUserId)),
                userId2: Math.max(currentUserId, parseInt(targetUserId)),
                status: 'connected'
            }
        });
        if (!created) {
            await connection.update({ status: 'connected' });
        }
        res.json({
            success: true,
            connectionState: {
                id: connection.id,
                userId1: connection.userId1,
                userId2: connection.userId2,
                status: connection.status,
                createdAt: connection.createdAt,
                updatedAt: connection.updatedAt
            },
            message: 'Successfully connected'
        });
    }
    catch (error) {
        console.error('Error connecting after match:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Get ice-breaking prompt
const getIceBreakingPrompt = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.user.id;
        if (!targetUserId) {
            res.status(400).json({ success: false, message: 'Target user ID is required' });
            return;
        }
        const match = await match_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: currentUserId, userId2: parseInt(targetUserId) },
                    { userId1: parseInt(targetUserId), userId2: currentUserId }
                ]
            }
        });
        if (!match) {
            res.status(404).json({ success: false, message: 'No match found' });
            return;
        }
        res.json({
            success: true,
            prompt: match.iceBreakingPrompt || generateIceBreakingPrompt(match.mutualAdjective),
            message: 'Ice-breaking prompt retrieved successfully'
        });
    }
    catch (error) {
        console.error('Error getting ice-breaking prompt:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Get available adjectives for a profile (with user engagement logic)
const getAvailableAdjectives = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.user.id;
        if (!targetUserId) {
            res.status(400).json({ success: false, message: 'Target user ID is required' });
            return;
        }
        // Get current user and target user for gender validation
        const [currentUser, targetUser] = await Promise.all([
            user_model_1.default.findByPk(currentUserId, { attributes: ['gender'] }),
            user_model_1.default.findByPk(targetUserId, { attributes: ['gender'] })
        ]);
        if (!currentUser || !targetUser) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        // Get allowed adjectives based on gender combination
        const allowedAdjectives = getAdjectivesForGender(currentUser.gender || 'Other', targetUser.gender || 'Other');
        // Check if target user has already selected an adjective for current user
        const targetUserSelection = await adjectiveSelection_model_1.default.findOne({
            where: {
                userId: parseInt(targetUserId),
                targetUserId: currentUserId
            }
        });
        // Check if current user has already selected an adjective for target user
        const currentUserSelection = await adjectiveSelection_model_1.default.findOne({
            where: {
                userId: currentUserId,
                targetUserId: parseInt(targetUserId)
            }
        });
        let adjectives = [];
        if (targetUserSelection) {
            // Target user has selected an adjective for current user: show that + 3 random
            const targetSelectedAdjective = targetUserSelection.adjective;
            const remainingAdjectives = allowedAdjectives.filter(adj => adj !== targetSelectedAdjective);
            // Shuffle and take 3 random
            const shuffled = remainingAdjectives.sort(() => 0.5 - Math.random());
            const randomAdjectives = shuffled.slice(0, 3);
            adjectives = [targetSelectedAdjective, ...randomAdjectives];
        }
        else {
            // No selection from target user: show 4 random adjectives
            const shuffled = allowedAdjectives.sort(() => 0.5 - Math.random());
            adjectives = shuffled.slice(0, 4);
        }
        res.json({
            success: true,
            adjectives,
            hasTargetUserSelection: !!targetUserSelection,
            targetUserSelection: targetUserSelection?.adjective || null,
            hasCurrentUserSelection: !!currentUserSelection,
            currentUserSelection: currentUserSelection?.adjective || null
        });
    }
    catch (error) {
        console.error('Error getting available adjectives:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.default = {
    getUserGender,
    getAdjectiveSelections,
    selectAdjective,
    getMatchState,
    connectAfterMatch,
    getIceBreakingPrompt,
    getAvailableAdjectives
};

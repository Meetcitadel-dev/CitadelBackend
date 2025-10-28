"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnboardingStatus = exports.completeOnboarding = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const userProfile_controller_1 = require("./userProfile.controller");
const completeOnboarding = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { name, university, degree, year, gender, dob, skills, friends, email } = req.body;
        // Validate required fields - only university, degree, year, and gender are required
        if (!university || !degree || !year || !gender) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['university', 'degree', 'year', 'gender'],
                received: { university, degree, year, gender, name, dob, skills, friends }
            });
        }
        // Find the user
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Parse date of birth if provided
        let dateOfBirth = undefined;
        if (dob && dob.year && dob.month && dob.day) {
            dateOfBirth = new Date(`${dob.year}-${dob.month}-${dob.day}`);
        }
        // Generate username if not already set
        let username = user.username;
        if (!username && name) {
            username = await (0, userProfile_controller_1.generateUsername)(name);
        }
        // Update user profile - only update fields that are provided
        const updateData = {
            universityId: university.id,
            degree,
            year,
            gender,
            isProfileComplete: true
        };
        if (name)
            updateData.name = name;
        if (username)
            updateData.username = username;
        if (dateOfBirth)
            updateData.dateOfBirth = dateOfBirth;
        if (skills)
            updateData.skills = skills;
        if (friends)
            updateData.friends = friends;
        Object.assign(user, updateData);
        await user.save();
        res.json({
            success: true,
            message: 'Onboarding completed successfully',
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username,
                universityId: user.universityId,
                degree: user.degree,
                year: user.year,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                skills: user.skills,
                friends: user.friends,
                isProfileComplete: user.isProfileComplete,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Error completing onboarding:', error);
        res.status(500).json({ error: 'Failed to complete onboarding' });
    }
};
exports.completeOnboarding = completeOnboarding;
const getOnboardingStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            data: {
                isProfileComplete: user.isProfileComplete,
                profile: user.isProfileComplete ? {
                    name: user.name,
                    universityId: user.universityId,
                    degree: user.degree,
                    year: user.year,
                    gender: user.gender,
                    dateOfBirth: user.dateOfBirth,
                    skills: user.skills,
                    friends: user.friends
                } : null
            }
        });
    }
    catch (error) {
        console.error('Error getting onboarding status:', error);
        res.status(500).json({ error: 'Failed to get onboarding status' });
    }
};
exports.getOnboardingStatus = getOnboardingStatus;

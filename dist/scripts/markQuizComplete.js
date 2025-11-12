"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user.model"));
async function markQuizComplete() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in environment variables');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        // Get user by email
        const email = process.argv[2];
        if (!email) {
            console.log('Usage: ts-node markQuizComplete.ts <email>');
            process.exit(1);
        }
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            console.log(`❌ User not found with email: ${email}`);
            process.exit(1);
        }
        console.log('\n📊 Before Update:');
        console.log('==================');
        console.log('Email:', user.email);
        console.log('Has Completed Quiz:', user.hasCompletedQuiz);
        console.log('Quiz Score:', user.quizScore);
        console.log('==================\n');
        // Update user to mark quiz as complete
        user.hasCompletedQuiz = true;
        user.quizScore = 100; // Set a default score
        user.quizCompletedAt = new Date();
        await user.save();
        console.log('✅ Quiz marked as complete!');
        console.log('\n📊 After Update:');
        console.log('==================');
        console.log('Email:', user.email);
        console.log('Has Completed Quiz:', user.hasCompletedQuiz);
        console.log('Quiz Score:', user.quizScore);
        console.log('Quiz Completed At:', user.quizCompletedAt);
        console.log('==================\n');
        await mongoose_1.default.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
markQuizComplete();

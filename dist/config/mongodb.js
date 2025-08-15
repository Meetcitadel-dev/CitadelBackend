"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectMongoDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ MongoDB connected successfully (Atlas)');
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.log('💡 Check your MONGODB_URI in .env file or install MongoDB locally');
    }
};
exports.default = connectMongoDB;

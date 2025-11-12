"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// This script generates valid JWT tokens for testing
// Run this after setting up the .env file with JWT_SECRET
function generateValidTokens() {
    console.log('🔐 Generating Valid JWT Tokens...\n');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_2024';
    // Generate token for User 1 (Ankit)
    const user1Token = jsonwebtoken_1.default.sign({
        sub: 15,
        username: 'ankitranjan_21412',
        role: 'USER',
        email: 'ankitranjan_21412@aitpune.edu.in'
    }, JWT_SECRET, { expiresIn: '5d' });
    // Generate token for User 2 (Nisarg)
    const user2Token = jsonwebtoken_1.default.sign({
        sub: 16,
        username: 'nisargpatel_21412',
        role: 'USER',
        email: 'nisargpatel_21412@aitpune.edu.in'
    }, JWT_SECRET, { expiresIn: '5d' });
    console.log('✅ Generated Valid Tokens:\n');
    console.log('🔑 User 1 (Ankit) Token:');
    console.log(user1Token);
    console.log('\n🔑 User 2 (Nisarg) Token:');
    console.log(user2Token);
    console.log('\n📋 Copy these tokens to your test scripts!');
    console.log('\n⚠️  IMPORTANT: Make sure your .env file has JWT_SECRET set!');
}
generateValidTokens();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const BASE_URL = 'http://localhost:3000/api/v1';
async function testConversationDetails() {
    var _a;
    try {
        // Generate a valid token for user ID 15 (Ankit)
        const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_2024';
        const token = jsonwebtoken_1.default.sign({
            sub: 15,
            username: 'ankitranjan_21412',
            role: 'USER',
            email: 'ankitranjan_21412@aitpune.edu.in'
        }, JWT_SECRET, { expiresIn: '5d' });
        console.log('Using token for user ID 15 (Ankit)');
        // First, let's create a conversation between user 15 and user 30
        console.log('Creating conversation between user 15 and user 30...');
        const conversationResponse = await axios_1.default.get(`${BASE_URL}/chats/conversation/30`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Conversation created:', conversationResponse.data);
        if (conversationResponse.data.success) {
            const conversationId = conversationResponse.data.conversation.id;
            console.log('Testing conversation details with ID:', conversationId);
            // Test the new conversation details endpoint
            const detailsResponse = await axios_1.default.get(`${BASE_URL}/chats/conversation/details/${conversationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Conversation details response:', detailsResponse.data);
        }
    }
    catch (error) {
        console.error('Error testing conversation details:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
}
testConversationDetails();

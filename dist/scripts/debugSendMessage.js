"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function debugSendMessage() {
    try {
        console.log('🔍 Debugging Send Message...');
        // Nisarg's token (user 30)
        const nisargToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDM5NTAxNywiZXhwIjoxNzU0ODI3MDE3fQ.LpUQaTFoOnRMqDze7eCxE5vtUe1v3pQal6lZLr7uhcU';
        const headers = {
            'Authorization': `Bearer ${nisargToken}`,
            'Content-Type': 'application/json'
        };
        // Test send message with existing conversation
        console.log('\n📝 Testing send message...');
        try {
            const sendMessageResponse = await axios_1.default.post('http://localhost:3000/api/v1/enhanced-chats/send-message', {
                conversationId: '0d82c5c9-aa26-4119-9bd0-1bc62b671682',
                text: 'Debug test message'
            }, { headers });
            console.log('Status:', sendMessageResponse.status);
            console.log('Response:', sendMessageResponse.data);
        }
        catch (error) {
            console.error('❌ Send message failed:');
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Message:', error.message);
        }
    }
    catch (error) {
        console.error('❌ Debug failed:', error.response?.data || error.message);
    }
}
debugSendMessage();

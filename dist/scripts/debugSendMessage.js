"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function debugSendMessage() {
    var _a, _b, _c;
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
            console.error('Status:', (_a = error.response) === null || _a === void 0 ? void 0 : _a.status);
            console.error('Data:', (_b = error.response) === null || _b === void 0 ? void 0 : _b.data);
            console.error('Message:', error.message);
        }
    }
    catch (error) {
        console.error('❌ Debug failed:', ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
    }
}
debugSendMessage();

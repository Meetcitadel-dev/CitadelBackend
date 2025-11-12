"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function testConversationMessages() {
    var _a, _b, _c;
    try {
        console.log('🧪 Testing Conversation Messages...');
        // Ankit's token (user 15)
        const ankitToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
        const headers = {
            'Authorization': `Bearer ${ankitToken}`,
            'Content-Type': 'application/json'
        };
        // Test conversation messages
        console.log('\n📝 Testing GET /api/v1/chats/0d82c5c9-aa26-4119-9bd0-1bc62b671682/messages');
        try {
            const messagesResponse = await axios_1.default.get('http://localhost:3000/api/v1/chats/0d82c5c9-aa26-4119-9bd0-1bc62b671682/messages', { headers });
            console.log('Status:', messagesResponse.status);
            console.log('Response:', JSON.stringify(messagesResponse.data, null, 2));
        }
        catch (error) {
            console.error('❌ Conversation messages failed:');
            console.error('Status:', (_a = error.response) === null || _a === void 0 ? void 0 : _a.status);
            console.error('Data:', (_b = error.response) === null || _b === void 0 ? void 0 : _b.data);
            console.error('Message:', error.message);
        }
    }
    catch (error) {
        console.error('❌ Test failed:', ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
    }
}
testConversationMessages();

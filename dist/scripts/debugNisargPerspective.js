"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function debugNisargPerspective() {
    try {
        console.log('🔍 Debugging from Nisarg\'s Perspective...');
        // Nisarg's token (user 30)
        const nisargToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDM5NTAxNywiZXhwIjoxNzU0ODI3MDE3fQ.LpUQaTFoOnRMqDze7eCxE5vtUe1v3pQal6lZLr7uhcU';
        const headers = {
            'Authorization': `Bearer ${nisargToken}`,
            'Content-Type': 'application/json'
        };
        // Test 1: Check enhanced matches endpoint from Nisarg's perspective
        console.log('\n📝 Test 1: GET /api/v1/enhanced-chats/matches (Nisarg\'s view)');
        try {
            const matchesResponse = await axios_1.default.get('http://localhost:3000/api/v1/enhanced-chats/matches', { headers });
            console.log('Status:', matchesResponse.status);
            console.log('Response:', JSON.stringify(matchesResponse.data, null, 2));
        }
        catch (error) {
            console.error('❌ Enhanced matches failed:', error.response?.data || error.message);
        }
        // Test 2: Check old matches endpoint from Nisarg's perspective
        console.log('\n📝 Test 2: GET /api/v1/chats/matches (Nisarg\'s view)');
        try {
            const oldMatchesResponse = await axios_1.default.get('http://localhost:3000/api/v1/chats/matches', { headers });
            console.log('Status:', oldMatchesResponse.status);
            console.log('Response:', JSON.stringify(oldMatchesResponse.data, null, 2));
        }
        catch (error) {
            console.error('❌ Old matches failed:', error.response?.data || error.message);
        }
        // Test 3: Check active conversations from Nisarg's perspective
        console.log('\n📝 Test 3: GET /api/v1/chats/active (Nisarg\'s view)');
        try {
            const activeResponse = await axios_1.default.get('http://localhost:3000/api/v1/chats/active', { headers });
            console.log('Status:', activeResponse.status);
            console.log('Response:', JSON.stringify(activeResponse.data, null, 2));
        }
        catch (error) {
            console.error('❌ Active conversations failed:', error.response?.data || error.message);
        }
    }
    catch (error) {
        console.error('❌ Debug failed:', error.response?.data || error.message);
    }
}
debugNisargPerspective();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function debugConnectionStatus() {
    try {
        console.log('🔍 Debugging Connection Status...');
        // Ankit's token (user 15)
        const ankitToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
        const headers = {
            'Authorization': `Bearer ${ankitToken}`,
            'Content-Type': 'application/json'
        };
        // Test 1: Check enhanced matches endpoint
        console.log('\n📝 Test 1: GET /api/v1/enhanced-chats/matches');
        try {
            const matchesResponse = await axios_1.default.get('http://localhost:3000/api/v1/enhanced-chats/matches', { headers });
            console.log('Status:', matchesResponse.status);
            console.log('Response:', JSON.stringify(matchesResponse.data, null, 2));
        }
        catch (error) {
            console.error('❌ Enhanced matches failed:', error.response?.data || error.message);
        }
        // Test 2: Check old matches endpoint for comparison
        console.log('\n📝 Test 2: GET /api/v1/chats/matches');
        try {
            const oldMatchesResponse = await axios_1.default.get('http://localhost:3000/api/v1/chats/matches', { headers });
            console.log('Status:', oldMatchesResponse.status);
            console.log('Response:', JSON.stringify(oldMatchesResponse.data, null, 2));
        }
        catch (error) {
            console.error('❌ Old matches failed:', error.response?.data || error.message);
        }
        // Test 3: Check active conversations
        console.log('\n📝 Test 3: GET /api/v1/chats/active');
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
debugConnectionStatus();

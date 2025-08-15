"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function testUserProfile() {
    try {
        console.log('🧪 Testing User Profile Endpoint...');
        // Ankit's token (user 15)
        const ankitToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
        const headers = {
            'Authorization': `Bearer ${ankitToken}`,
            'Content-Type': 'application/json'
        };
        // Test user profile endpoint
        console.log('\n📝 Testing GET /api/v1/users/nisargpatel');
        try {
            const profileResponse = await axios_1.default.get('http://localhost:3000/api/v1/users/nisargpatel', { headers });
            console.log('Status:', profileResponse.status);
            console.log('Response:', JSON.stringify(profileResponse.data, null, 2));
        }
        catch (error) {
            console.error('❌ User profile failed:', error.response?.data || error.message);
        }
    }
    catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}
testUserProfile();

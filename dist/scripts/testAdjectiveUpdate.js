"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function testAdjectiveEndpoints() {
    try {
        console.log('🧪 Testing Adjective Endpoints...');
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        // Test 1: Old endpoint with "Smart" (should work)
        console.log('\n📝 Test 1: Old endpoint with "Smart"');
        try {
            const response1 = await axios_1.default.post('http://localhost:3000/api/v1/explore/adjectives/select', {
                targetUserId: 30,
                adjective: 'Smart'
            }, { headers });
            console.log(`Status: ${response1.status}`);
            console.log('Response:', response1.data);
        }
        catch (error) {
            console.error('❌ Error:', error.response?.data || error.message);
        }
        // Test 2: Old endpoint with "Disciplined" (should work now)
        console.log('\n📝 Test 2: Old endpoint with "Disciplined"');
        try {
            const response2 = await axios_1.default.post('http://localhost:3000/api/v1/explore/adjectives/select', {
                targetUserId: 30,
                adjective: 'Disciplined'
            }, { headers });
            console.log(`Status: ${response2.status}`);
            console.log('Response:', response2.data);
        }
        catch (error) {
            console.error('❌ Error:', error.response?.data || error.message);
        }
        // Test 3: Enhanced endpoint with "Smart"
        console.log('\n📝 Test 3: Enhanced endpoint with "Smart"');
        try {
            const response3 = await axios_1.default.post('http://localhost:3000/api/v1/enhanced-explore/adjectives/select', {
                targetUserId: 30,
                adjective: 'Smart'
            }, { headers });
            console.log(`Status: ${response3.status}`);
            console.log('Response:', response3.data);
        }
        catch (error) {
            console.error('❌ Error:', error.response?.data || error.message);
        }
        // Test 4: Enhanced endpoint with "Disciplined"
        console.log('\n📝 Test 4: Enhanced endpoint with "Disciplined"');
        try {
            const response4 = await axios_1.default.post('http://localhost:3000/api/v1/enhanced-explore/adjectives/select', {
                targetUserId: 30,
                adjective: 'Disciplined'
            }, { headers });
            console.log(`Status: ${response4.status}`);
            console.log('Response:', response4.data);
        }
        catch (error) {
            console.error('❌ Error:', error.response?.data || error.message);
        }
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}
testAdjectiveEndpoints();

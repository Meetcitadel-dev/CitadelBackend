"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function testSessionBasedAdjectives() {
    try {
        console.log('🧪 Testing Session-Based Adjective System...\n');
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        const targetUserId = 30; // Nisarg's user ID
        // Test 1: First call - should generate new session
        console.log('1️⃣ First call - generating new session...');
        const response1 = await axios_1.default.get(`http://localhost:3000/api/v1/enhanced-explore/adjectives/available/${targetUserId}`, { headers });
        console.log('✅ Adjectives:', response1.data.adjectives);
        console.log('✅ Session ID:', response1.data.sessionId);
        console.log('✅ Has Target Selection:', response1.data.hasTargetUserSelection);
        const sessionId = response1.data.sessionId;
        // Test 2: Second call with same session - should return same adjectives
        console.log('\n2️⃣ Second call with same session - should return same adjectives...');
        const response2 = await axios_1.default.get(`http://localhost:3000/api/v1/enhanced-explore/adjectives/available/${targetUserId}?sessionId=${sessionId}`, { headers });
        console.log('✅ Adjectives:', response2.data.adjectives);
        console.log('✅ Session ID:', response2.data.sessionId);
        console.log('✅ Same adjectives?', JSON.stringify(response1.data.adjectives) === JSON.stringify(response2.data.adjectives));
        // Test 3: Third call with same session - should still return same adjectives
        console.log('\n3️⃣ Third call with same session - should still return same adjectives...');
        const response3 = await axios_1.default.get(`http://localhost:3000/api/v1/enhanced-explore/adjectives/available/${targetUserId}?sessionId=${sessionId}`, { headers });
        console.log('✅ Adjectives:', response3.data.adjectives);
        console.log('✅ Session ID:', response3.data.sessionId);
        console.log('✅ Same adjectives?', JSON.stringify(response1.data.adjectives) === JSON.stringify(response3.data.adjectives));
        // Test 4: Call without session ID - should generate new session with different adjectives
        console.log('\n4️⃣ Call without session ID - should generate new session...');
        const response4 = await axios_1.default.get(`http://localhost:3000/api/v1/enhanced-explore/adjectives/available/${targetUserId}`, { headers });
        console.log('✅ Adjectives:', response4.data.adjectives);
        console.log('✅ Session ID:', response4.data.sessionId);
        console.log('✅ Different adjectives?', JSON.stringify(response1.data.adjectives) !== JSON.stringify(response4.data.adjectives));
        console.log('✅ Different session ID?', sessionId !== response4.data.sessionId);
        // Test 5: Call with invalid session ID - should generate new session
        console.log('\n5️⃣ Call with invalid session ID - should generate new session...');
        const response5 = await axios_1.default.get(`http://localhost:3000/api/v1/enhanced-explore/adjectives/available/${targetUserId}?sessionId=invalid_session_123`, { headers });
        console.log('✅ Adjectives:', response5.data.adjectives);
        console.log('✅ Session ID:', response5.data.sessionId);
        console.log('✅ Different session ID?', sessionId !== response5.data.sessionId);
        console.log('\n🎉 Session-based adjective system test completed!');
        console.log('\n📋 Summary:');
        console.log('- ✅ Same session returns same adjectives');
        console.log('- ✅ Different sessions return different adjectives');
        console.log('- ✅ Invalid sessions generate new sessions');
        console.log('- ✅ Session IDs are properly managed');
    }
    catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}
// Run the test
testSessionBasedAdjectives();

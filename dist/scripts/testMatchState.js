"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function testMatchState() {
    var _a, _b;
    try {
        console.log('🧪 Testing Match State Endpoint...');
        // Ankit's token (user 15)
        const ankitToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
        const headers = {
            'Authorization': `Bearer ${ankitToken}`,
            'Content-Type': 'application/json'
        };
        // Test match state endpoint
        console.log('\n📝 Testing GET /api/v1/enhanced-explore/matches/state/30');
        try {
            const matchStateResponse = await axios_1.default.get('http://localhost:3000/api/v1/enhanced-explore/matches/state/30', { headers });
            console.log('Status:', matchStateResponse.status);
            console.log('Response:', JSON.stringify(matchStateResponse.data, null, 2));
        }
        catch (error) {
            console.error('❌ Match state failed:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        }
    }
    catch (error) {
        console.error('❌ Test failed:', ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
    }
}
testMatchState();

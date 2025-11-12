"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function testGridView() {
    var _a, _b;
    try {
        console.log('🧪 Testing GridView API...');
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        // Test gridview endpoint
        console.log('\n📡 Testing GET /api/v1/users/gridview');
        const response = await axios_1.default.get('http://localhost:3000/api/v1/users/gridview?limit=10', { headers });
        console.log(`Status: ${response.status}`);
        console.log('Response:', response.data);
        if (response.data.success) {
            console.log(`✅ Found ${((_a = response.data.profiles) === null || _a === void 0 ? void 0 : _a.length) || 0} profiles`);
        }
        else {
            console.log('❌ GridView failed:', response.data.message);
        }
    }
    catch (error) {
        console.error('❌ GridView test failed:', ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
    }
}
testGridView();

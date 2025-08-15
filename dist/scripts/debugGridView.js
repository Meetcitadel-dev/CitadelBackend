"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function debugGridView() {
    try {
        console.log('🔍 Debugging GridView API...');
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        // Test basic endpoint first
        console.log('\n📡 Testing basic endpoint...');
        const basicResponse = await axios_1.default.get('http://localhost:3000/api/test', { headers });
        console.log(`Basic endpoint status: ${basicResponse.status}`);
        // Test gridview endpoint with detailed error handling
        console.log('\n📡 Testing GET /api/v1/users/gridview');
        try {
            const response = await axios_1.default.get('http://localhost:3000/api/v1/users/gridview?limit=10', {
                headers,
                timeout: 10000
            });
            console.log(`Status: ${response.status}`);
            console.log('Response:', response.data);
        }
        catch (error) {
            console.error('❌ Detailed error:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });
        }
    }
    catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}
debugGridView();

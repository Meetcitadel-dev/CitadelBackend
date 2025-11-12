"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000';
// Use the JWT token from your frontend request
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';
async function testGroupsPost() {
    var _a, _b;
    console.log('🧪 Testing POST /api/v1/groups endpoint...\n');
    try {
        // Test 1: Check if server is running
        console.log('✅ Test 1: Checking server status...');
        const testResponse = await axios_1.default.get(`${BASE_URL}/api/test`);
        console.log('✅ Server is running:', testResponse.data);
        // Test 2: Test POST groups endpoint with valid auth
        console.log('\n✅ Test 2: Testing POST /api/v1/groups with valid auth...');
        try {
            const response = await axios_1.default.post(`${BASE_URL}/api/v1/groups`, {
                name: 'Test Group',
                description: 'Test group description',
                memberIds: []
            }, {
                headers: {
                    Authorization: `Bearer ${JWT_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ POST request successful!');
            console.log('Response:', response.data);
        }
        catch (error) {
            console.log('❌ POST request failed:', (_a = error.response) === null || _a === void 0 ? void 0 : _a.status);
            console.log('Error message:', (_b = error.response) === null || _b === void 0 ? void 0 : _b.data);
        }
        console.log('\n🎉 Groups POST endpoint test completed!');
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Server is not running. Start it with: npm run dev');
        }
    }
}
testGroupsPost();

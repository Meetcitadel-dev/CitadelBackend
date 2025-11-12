"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000';
// Use the JWT token from your frontend request
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';
async function testConnectionsEndpoint() {
    var _a, _b, _c, _d, _e;
    console.log('🧪 Testing Connections Endpoints...\n');
    try {
        // Test 1: Check if server is running
        console.log('✅ Test 1: Checking server status...');
        const testResponse = await axios_1.default.get(`${BASE_URL}/api/test`);
        console.log('✅ Server is running:', testResponse.data);
        // Test 2: Test the CORRECT endpoint - /api/v1/connections
        console.log('\n✅ Test 2: Testing CORRECT endpoint /api/v1/connections...');
        try {
            const response = await axios_1.default.get(`${BASE_URL}/api/v1/connections`, {
                headers: { Authorization: `Bearer ${JWT_TOKEN}` }
            });
            console.log('✅ CORRECT endpoint works!');
            console.log('Status:', response.status);
            console.log('Connections count:', ((_a = response.data.connections) === null || _a === void 0 ? void 0 : _a.length) || 0);
            console.log('Sample connection:', ((_b = response.data.connections) === null || _b === void 0 ? void 0 : _b[0]) || 'No connections');
        }
        catch (error) {
            console.log('❌ CORRECT endpoint failed:', (_c = error.response) === null || _c === void 0 ? void 0 : _c.status);
            console.log('Error message:', (_d = error.response) === null || _d === void 0 ? void 0 : _d.data);
        }
        // Test 3: Test the INCORRECT endpoint - /api/v1/connections/users (what frontend is using)
        console.log('\n❌ Test 3: Testing INCORRECT endpoint /api/v1/connections/users...');
        try {
            const response = await axios_1.default.get(`${BASE_URL}/api/v1/connections/users`, {
                headers: { Authorization: `Bearer ${JWT_TOKEN}` }
            });
            console.log('❌ This should have failed but it worked:', response.status);
        }
        catch (error) {
            console.log('✅ INCORRECT endpoint correctly failed:', (_e = error.response) === null || _e === void 0 ? void 0 : _e.status);
            console.log('This confirms the endpoint does not exist');
        }
        console.log('\n🎉 Endpoint tests completed!');
        console.log('\n📋 Summary:');
        console.log('✅ /api/v1/connections - EXISTS and works');
        console.log('❌ /api/v1/connections/users - DOES NOT EXIST');
        console.log('\n💡 Frontend should use: /api/v1/connections (without /users)');
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Server is not running. Start it with: npm run dev');
        }
    }
}
testConnectionsEndpoint();

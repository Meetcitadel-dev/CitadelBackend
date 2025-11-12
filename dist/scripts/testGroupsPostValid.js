"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000';
// Use the JWT token from your frontend request
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';
async function testGroupsPostValid() {
    var _a, _b, _c, _d, _e, _f, _g;
    console.log('🧪 Testing POST /api/v1/groups with valid data...\n');
    try {
        // Test 1: Check if server is running
        console.log('✅ Test 1: Checking server status...');
        const testResponse = await axios_1.default.get(`${BASE_URL}/api/test`);
        console.log('✅ Server is running:', testResponse.data);
        // Test 2: Get user connections first
        console.log('\n✅ Test 2: Getting user connections...');
        try {
            const connectionsResponse = await axios_1.default.get(`${BASE_URL}/api/v1/connections`, {
                headers: { Authorization: `Bearer ${JWT_TOKEN}` }
            });
            console.log('✅ Connections retrieved successfully!');
            console.log('Connections count:', ((_a = connectionsResponse.data.connections) === null || _a === void 0 ? void 0 : _a.length) || 0);
            // Test 3: Test POST groups endpoint with valid data
            console.log('\n✅ Test 3: Testing POST /api/v1/groups with valid data...');
            const memberIds = ((_b = connectionsResponse.data.connections) === null || _b === void 0 ? void 0 : _b.slice(0, 2).map((conn) => conn.id)) || [];
            if (memberIds.length > 0) {
                const response = await axios_1.default.post(`${BASE_URL}/api/v1/groups`, {
                    name: 'Test Group from Backend',
                    description: 'Test group created from backend script',
                    memberIds: memberIds
                }, {
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✅ POST request successful!');
                console.log('Group created:', (_c = response.data.group) === null || _c === void 0 ? void 0 : _c.name);
                console.log('Group ID:', (_d = response.data.group) === null || _d === void 0 ? void 0 : _d.id);
                console.log('Member count:', (_e = response.data.group) === null || _e === void 0 ? void 0 : _e.memberCount);
            }
            else {
                console.log('⚠️ No connections available to create group with');
                console.log('This is expected if the user has no connections');
            }
        }
        catch (error) {
            console.log('❌ Request failed:', (_f = error.response) === null || _f === void 0 ? void 0 : _f.status);
            console.log('Error message:', (_g = error.response) === null || _g === void 0 ? void 0 : _g.data);
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
testGroupsPostValid();

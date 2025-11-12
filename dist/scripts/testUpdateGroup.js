"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000';
// Use the JWT token from your frontend request
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';
async function testUpdateGroup() {
    var _a, _b, _c, _d, _e;
    console.log('🧪 Testing PUT /api/v1/groups/{groupId} endpoint...\n');
    try {
        // Test 1: Check if server is running
        console.log('✅ Test 1: Checking server status...');
        const testResponse = await axios_1.default.get(`${BASE_URL}/api/test`);
        console.log('✅ Server is running:', testResponse.data);
        // Test 2: Get user's groups first
        console.log('\n✅ Test 2: Getting user\'s groups...');
        try {
            const groupsResponse = await axios_1.default.get(`${BASE_URL}/api/v1/groups`, {
                headers: { Authorization: `Bearer ${JWT_TOKEN}` }
            });
            console.log('✅ Groups retrieved successfully!');
            console.log('Groups count:', ((_a = groupsResponse.data.groups) === null || _a === void 0 ? void 0 : _a.length) || 0);
            if (((_b = groupsResponse.data.groups) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                const firstGroup = groupsResponse.data.groups[0];
                console.log('First group:', firstGroup.name, 'ID:', firstGroup.id);
                // Test 3: Update the first group
                console.log('\n✅ Test 3: Updating group name...');
                const updateResponse = await axios_1.default.put(`${BASE_URL}/api/v1/groups/${firstGroup.id}`, {
                    name: 'Updated Group Name Test'
                }, {
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✅ Update request successful!');
                console.log('Response:', updateResponse.data);
            }
            else {
                console.log('⚠️ No groups available to update');
            }
        }
        catch (error) {
            console.log('❌ Request failed:', (_c = error.response) === null || _c === void 0 ? void 0 : _c.status);
            console.log('Error message:', (_d = error.response) === null || _d === void 0 ? void 0 : _d.data);
            console.log('Full error:', (_e = error.response) === null || _e === void 0 ? void 0 : _e.data);
        }
        console.log('\n🎉 Group update test completed!');
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Server is not running. Start it with: npm run dev');
        }
    }
}
testUpdateGroup();

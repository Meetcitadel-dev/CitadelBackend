"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const socket_io_client_1 = require("socket.io-client");
const BASE_URL = 'http://localhost:3000';
// Use the JWT token from your frontend request
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';
async function testGroupChatWebSocket() {
    var _a, _b;
    console.log('🧪 Testing Group Chat WebSocket functionality...\n');
    try {
        // Test 1: Check if server is running
        console.log('✅ Test 1: Checking server status...');
        const testResponse = await axios_1.default.get(`${BASE_URL}/api/test`);
        console.log('✅ Server is running:', testResponse.data);
        // Test 2: Get user's groups
        console.log('\n✅ Test 2: Getting user\'s groups...');
        const groupsResponse = await axios_1.default.get(`${BASE_URL}/api/v1/groups`, {
            headers: { Authorization: `Bearer ${JWT_TOKEN}` }
        });
        console.log('✅ Groups retrieved successfully!');
        console.log('Groups count:', ((_a = groupsResponse.data.groups) === null || _a === void 0 ? void 0 : _a.length) || 0);
        if (((_b = groupsResponse.data.groups) === null || _b === void 0 ? void 0 : _b.length) === 0) {
            console.log('⚠️ No groups available for testing');
            return;
        }
        const testGroup = groupsResponse.data.groups[0];
        console.log('Testing with group:', testGroup.name, 'ID:', testGroup.id);
        // Test 3: Connect to WebSocket
        console.log('\n✅ Test 3: Connecting to WebSocket...');
        const socket = (0, socket_io_client_1.io)(BASE_URL, {
            auth: {
                token: JWT_TOKEN
            }
        });
        socket.on('connect', () => {
            console.log('✅ WebSocket connected successfully!');
            // Test 4: Join group
            console.log('\n✅ Test 4: Joining group...');
            socket.emit('join-group', { groupId: testGroup.id });
        });
        socket.on('group-message', (data) => {
            console.log('📨 Received group message:', data);
        });
        socket.on('group-updated', (data) => {
            console.log('🔄 Group updated:', data);
        });
        socket.on('group-deleted', (data) => {
            console.log('🗑️ Group deleted:', data);
        });
        socket.on('member-joined', (data) => {
            console.log('👋 Member joined:', data);
        });
        socket.on('member-left', (data) => {
            console.log('👋 Member left:', data);
        });
        socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
        });
        socket.on('error', (error) => {
            console.log('❌ WebSocket error:', error);
        });
        // Test 5: Send a group message via HTTP API
        console.log('\n✅ Test 5: Sending group message via HTTP API...');
        setTimeout(async () => {
            var _a;
            try {
                const messageResponse = await axios_1.default.post(`${BASE_URL}/api/v1/groups/${testGroup.id}/messages`, {
                    content: 'Hello from WebSocket test!'
                }, {
                    headers: {
                        Authorization: `Bearer ${JWT_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✅ Message sent successfully!');
                console.log('Message response:', messageResponse.data);
            }
            catch (error) {
                console.log('❌ Failed to send message:', (_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
            }
        }, 2000);
        // Test 6: Test group typing indicators
        console.log('\n✅ Test 6: Testing group typing indicators...');
        setTimeout(() => {
            socket.emit('group-typing-start', { groupId: testGroup.id });
            console.log('📝 Started typing indicator');
            setTimeout(() => {
                socket.emit('group-typing-stop', { groupId: testGroup.id });
                console.log('📝 Stopped typing indicator');
            }, 2000);
        }, 4000);
        // Clean up after 10 seconds
        setTimeout(() => {
            console.log('\n🧹 Cleaning up...');
            socket.disconnect();
            console.log('🎉 Group chat WebSocket test completed!');
        }, 10000);
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Server is not running. Start it with: npm run dev');
        }
    }
}
testGroupChatWebSocket();

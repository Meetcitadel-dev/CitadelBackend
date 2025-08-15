"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;
// Fresh tokens from the user's request
const NISARG_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';
const ANKIT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM4LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0ODU3MDU4LCJleHAiOjE3NTUyODkwNTh9.LONTTE4Nzuc5z4FlFSTLcC3IneriUs68zFXbws_mvKg';
class RealTimeTestWithFreshTokens {
    constructor() {
        this.users = [];
        this.testGroupId = 4; // Group "Crazy_boys"
        this.users = [
            {
                id: 30,
                name: 'Nisarg Patel',
                token: NISARG_TOKEN,
                socket: null,
                receivedMessages: [],
                receivedTypingEvents: []
            },
            {
                id: 38,
                name: 'Ankit Kumar Ranjan',
                token: ANKIT_TOKEN,
                socket: null,
                receivedMessages: [],
                receivedTypingEvents: []
            }
        ];
    }
    async runTest() {
        console.log('🧪 Testing Real-Time Communication with Fresh Tokens...\n');
        console.log(`📋 Testing group ID: ${this.testGroupId} (Crazy_boys)\n`);
        try {
            // Step 1: Verify both users can access the group
            await this.verifyGroupAccess();
            // Step 2: Connect both users to WebSocket
            await this.connectUsers();
            // Step 3: Both users join the group
            await this.joinGroup();
            // Step 4: Nisarg sends a message via API
            await this.sendMessageViaAPI(0, 'Hello from Nisarg! Testing real-time communication 👋');
            // Step 5: Wait and check if Ankit received the message
            await this.wait(3000);
            this.checkReceivedMessages('After Nisarg sent message');
            // Step 6: Ankit sends a message via API
            await this.wait(1000);
            await this.sendMessageViaAPI(1, 'Hi Nisarg! I received your message! 😊');
            // Step 7: Wait and check if Nisarg received the message
            await this.wait(3000);
            this.checkReceivedMessages('After Ankit sent message');
            // Step 8: Test typing indicators
            await this.testTypingIndicators();
            // Step 9: Final verification
            await this.wait(2000);
            this.checkReceivedMessages('Final verification');
            // Step 10: Cleanup
            await this.cleanup();
        }
        catch (error) {
            console.error('❌ Test failed:', error);
        }
    }
    async verifyGroupAccess() {
        console.log('🔍 Verifying group access with fresh tokens...');
        for (const user of this.users) {
            try {
                const response = await axios_1.default.get(`${API_BASE}/groups/${this.testGroupId}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.data.success) {
                    console.log(`✅ User ${user.name} has access to group ${this.testGroupId}`);
                    console.log(`   Group: "${response.data.group.name}"`);
                    console.log(`   Members: ${response.data.group.memberCount}`);
                }
                else {
                    console.log(`❌ User ${user.name} does not have access to group ${this.testGroupId}`);
                }
            }
            catch (error) {
                console.log(`❌ User ${user.name} cannot access group ${this.testGroupId}:`, error.response?.data?.message || error.message);
            }
        }
        console.log('');
    }
    async connectUsers() {
        console.log('🔌 Connecting users to WebSocket with fresh tokens...');
        for (let i = 0; i < this.users.length; i++) {
            const user = this.users[i];
            user.socket = (0, socket_io_client_1.io)(BASE_URL, {
                auth: {
                    token: user.token
                },
                transports: ['websocket', 'polling']
            });
            user.socket.on('connect', () => {
                console.log(`✅ User ${user.name} connected to WebSocket (Socket ID: ${user.socket.id})`);
            });
            user.socket.on('disconnect', () => {
                console.log(`❌ User ${user.name} disconnected from WebSocket`);
            });
            user.socket.on('connect_error', (error) => {
                console.error(`❌ User ${user.name} connection error:`, error.message);
            });
            user.socket.on('group-message', (data) => {
                console.log(`📨 User ${user.name} received group message: "${data.message.content}" from ${data.message.senderName}`);
                user.receivedMessages.push(data);
            });
            user.socket.on('group-user-typing', (data) => {
                console.log(`⌨️  User ${user.name} sees typing indicator from user ${data.userId}`);
                user.receivedTypingEvents.push(data);
            });
            user.socket.on('group-user-stopped-typing', (data) => {
                console.log(`⏹️  User ${user.name} sees typing stopped from user ${data.userId}`);
                user.receivedTypingEvents.push(data);
            });
            // Wait for connection
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error(`Connection timeout for ${user.name}`));
                }, 10000);
                user.socket.on('connect', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                user.socket.on('connect_error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
        }
        console.log('✅ All users connected!\n');
    }
    async joinGroup() {
        console.log('👥 Users joining group...');
        for (const user of this.users) {
            user.socket.emit('join-group', { groupId: this.testGroupId });
            console.log(`✅ User ${user.name} joined group ${this.testGroupId}`);
        }
        await this.wait(1000);
        console.log('✅ All users joined the group!\n');
    }
    async sendMessageViaAPI(userIndex, content) {
        const user = this.users[userIndex];
        console.log(`📤 User ${user.name} sending message via API: "${content}"`);
        try {
            const response = await axios_1.default.post(`${API_BASE}/groups/${this.testGroupId}/messages`, { content }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) {
                console.log(`✅ Message sent successfully by ${user.name}`);
                console.log(`📤 API Response:`, {
                    id: response.data.message.id,
                    content: response.data.message.content,
                    senderName: response.data.message.senderName,
                    timestamp: response.data.message.timestamp
                });
            }
            else {
                console.log(`❌ Failed to send message:`, response.data.message);
            }
        }
        catch (error) {
            console.error(`❌ Error sending message:`, error.response?.data || error.message);
        }
    }
    async testTypingIndicators() {
        console.log('\n⌨️  Testing typing indicators...');
        // Nisarg starts typing
        this.users[0].socket.emit('group-typing-start', { groupId: this.testGroupId });
        console.log(`⌨️  User ${this.users[0].name} started typing`);
        await this.wait(2000);
        // Nisarg stops typing
        this.users[0].socket.emit('group-typing-stop', { groupId: this.testGroupId });
        console.log(`⏹️  User ${this.users[0].name} stopped typing`);
        await this.wait(1000);
        // Ankit starts typing
        this.users[1].socket.emit('group-typing-start', { groupId: this.testGroupId });
        console.log(`⌨️  User ${this.users[1].name} started typing`);
        await this.wait(2000);
        // Ankit stops typing
        this.users[1].socket.emit('group-typing-stop', { groupId: this.testGroupId });
        console.log(`⏹️  User ${this.users[1].name} stopped typing`);
        console.log('✅ Typing indicators test completed!\n');
    }
    checkReceivedMessages(context) {
        console.log(`\n📊 Checking received messages (${context})...`);
        for (const user of this.users) {
            console.log(`\n📨 User ${user.name} received ${user.receivedMessages.length} messages:`);
            user.receivedMessages.forEach((msg, index) => {
                console.log(`  ${index + 1}. "${msg.message.content}" from ${msg.message.senderName}`);
            });
            console.log(`⌨️  User ${user.name} received ${user.receivedTypingEvents.length} typing events`);
        }
        // Verify that messages were received by other users
        const nisargMessages = this.users[0].receivedMessages.length;
        const ankitMessages = this.users[1].receivedMessages.length;
        console.log(`\n📈 Message delivery summary (${context}):`);
        console.log(`  Nisarg: ${nisargMessages} messages received`);
        console.log(`  Ankit: ${ankitMessages} messages received`);
        if (nisargMessages > 0 && ankitMessages > 0) {
            console.log('✅ Real-time messaging is working correctly!');
            console.log('🎉 BACKEND IS WORKING - This is a FRONTEND issue!');
        }
        else if (nisargMessages > 0 || ankitMessages > 0) {
            console.log('⚠️  Partial real-time messaging - some messages received');
            console.log('🔍 This might be a timing issue or partial backend issue');
        }
        else {
            console.log('❌ No real-time messaging - BACKEND issue detected');
            console.log('🔧 Backend WebSocket broadcasting is not working');
        }
    }
    async cleanup() {
        console.log('\n🧹 Cleaning up...');
        for (const user of this.users) {
            if (user.socket) {
                user.socket.emit('leave-group', { groupId: this.testGroupId });
                user.socket.disconnect();
            }
        }
        console.log('✅ Cleanup completed!');
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
// Run the test
const test = new RealTimeTestWithFreshTokens();
test.runTest().then(() => {
    console.log('\n🎉 Real-time test with fresh tokens completed!');
    process.exit(0);
}).catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
});

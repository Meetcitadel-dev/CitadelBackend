"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const BASE_URL = 'http://localhost:3000';
const TOKEN1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzOTgwNDQzLCJleHAiOjE3NTQ0MTI0NDN9.j3kzqpsGMVIFTJ1n2SERIxuU45HaUy-TCAwY0hiWP2c';
const TOKEN2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1Mzk0NjA1MSwiZXhwIjoxNzU0Mzc4MDUxfQ.hIN-ModhzpR8893QBAauikyMKflwejXOA0q1sCvp7dQ';
async function testFrontendWebSocket() {
    console.log('🧪 Testing Frontend WebSocket Simulation...\n');
    try {
        // Simulate two frontend users connecting
        console.log('🔌 Step 1: Connecting User 1 (Ankit)...');
        const socket1 = (0, socket_io_client_1.io)(BASE_URL, {
            auth: { token: TOKEN1 },
            transports: ['websocket', 'polling'] // Try both transports
        });
        console.log('🔌 Step 2: Connecting User 2 (Nisarg)...');
        const socket2 = (0, socket_io_client_1.io)(BASE_URL, {
            auth: { token: TOKEN2 },
            transports: ['websocket', 'polling']
        });
        // Set up event listeners for User 1
        socket1.on('connect', () => {
            console.log('✅ User 1 (Ankit) connected - Socket ID:', socket1.id);
        });
        socket1.on('new_message', (data) => {
            console.log('📨 User 1 received new message:', data);
        });
        socket1.on('message_sent', (data) => {
            console.log('✅ User 1 message sent confirmation:', data);
        });
        socket1.on('connect_error', (error) => {
            console.error('❌ User 1 connection error:', error.message);
        });
        socket1.on('error', (error) => {
            console.error('❌ User 1 WebSocket error:', error);
        });
        // Set up event listeners for User 2
        socket2.on('connect', () => {
            console.log('✅ User 2 (Nisarg) connected - Socket ID:', socket2.id);
        });
        socket2.on('new_message', (data) => {
            console.log('📨 User 2 received new message:', data);
        });
        socket2.on('message_sent', (data) => {
            console.log('✅ User 2 message sent confirmation:', data);
        });
        socket2.on('connect_error', (error) => {
            console.error('❌ User 2 connection error:', error.message);
        });
        socket2.on('error', (error) => {
            console.error('❌ User 2 WebSocket error:', error);
        });
        // Wait for both connections
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Test real-time messaging between users
        console.log('\n📤 Step 3: Testing real-time messaging...');
        // User 1 sends message to User 2
        setTimeout(() => {
            console.log('📤 User 1 sending message to User 2...');
            socket1.emit('send_message', {
                conversationId: '0d82c5c9-aa26-4119-9bd0-1bc62b671682', // Real conversation ID from your logs
                message: 'Hello Nisarg! This is Ankit speaking in real-time!'
            });
        }, 1000);
        // User 2 sends message to User 1
        setTimeout(() => {
            console.log('📤 User 2 sending message to User 1...');
            socket2.emit('send_message', {
                conversationId: '0d82c5c9-aa26-4119-9bd0-1bc62b671682', // Real conversation ID from your logs
                message: 'Hello Ankit! This is Nisarg responding in real-time!'
            });
        }, 3000);
        // Keep connection alive for testing
        setTimeout(() => {
            console.log('\n🔄 Test completed. Disconnecting...');
            socket1.disconnect();
            socket2.disconnect();
            process.exit(0);
        }, 10000);
    }
    catch (error) {
        console.error('❌ Error in frontend WebSocket test:', error);
    }
}
testFrontendWebSocket();

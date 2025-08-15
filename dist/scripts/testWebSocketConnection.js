"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const BASE_URL = 'http://localhost:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzNzI3NjI1LCJleHAiOjE3NTQxNTk2MjV9.sT6crFmHnsM8za-NJIaP5ph2mVuVkVY-RMuJL99SzJo';
async function testWebSocketConnection() {
    console.log('🧪 Testing WebSocket Connection...\n');
    try {
        // Create WebSocket connection
        const socket = (0, socket_io_client_1.io)(BASE_URL, {
            auth: {
                token: TOKEN
            }
        });
        // Connection events
        socket.on('connect', () => {
            console.log('✅ WebSocket connected successfully');
            console.log('Socket ID:', socket.id);
        });
        socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error.message);
        });
        socket.on('disconnect', (reason) => {
            console.log('🔌 WebSocket disconnected:', reason);
        });
        // Listen for new messages
        socket.on('new_message', (data) => {
            console.log('📨 Received new message:', data);
        });
        // Listen for message sent confirmation
        socket.on('message_sent', (data) => {
            console.log('✅ Message sent confirmation:', data);
        });
        // Listen for errors
        socket.on('error', (error) => {
            console.error('❌ WebSocket error:', error);
        });
        // Test sending a message after 2 seconds
        setTimeout(() => {
            console.log('\n📤 Testing message sending...');
            socket.emit('send_message', {
                conversationId: 'test-conversation-id',
                message: 'Hello from WebSocket test!'
            });
        }, 2000);
        // Keep connection alive for 10 seconds
        setTimeout(() => {
            console.log('\n🔄 Closing connection...');
            socket.disconnect();
            process.exit(0);
        }, 10000);
    }
    catch (error) {
        console.error('❌ Error in WebSocket test:', error);
    }
}
testWebSocketConnection();

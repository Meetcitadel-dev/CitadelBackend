import axios from 'axios';
import { io as Client } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000';
const TOKEN1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzNzI3NjI1LCJleHAiOjE3NTQxNTk2MjV9.sT6crFmHnsM8za-NJIaP5ph2mVuVkVY-RMuJL99SzJo';
const TOKEN2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE2LCJ1c2VybmFtZSI6Im5pc2FyZ3BhdGVsXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6Im5pc2FyZ3BhdGVsXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzNzI3NjI1LCJleHAiOjE3NTQxNTk2MjV9.sT6crFmHnsM8za-NJIaP5ph2mVuVkVY-RMuJL99SzJo';

async function testRealTimeChat() {
  console.log('🧪 Testing Real-Time Chat System...\n');

  try {
    // Test 1: Get conversations for both users
    console.log('📋 Test 1: Getting conversations...');
    
    const conversations1 = await axios.get(`${BASE_URL}/api/v1/chats/matches`, {
      headers: { 'Authorization': `Bearer ${TOKEN1}` }
    });
    
    const conversations2 = await axios.get(`${BASE_URL}/api/v1/chats/matches`, {
      headers: { 'Authorization': `Bearer ${TOKEN2}` }
    });

    console.log('User 1 conversations:', conversations1.data.conversations.length);
    console.log('User 2 conversations:', conversations2.data.conversations.length);

    // Test 2: Create WebSocket connections for both users
    console.log('\n🔌 Test 2: Creating WebSocket connections...');
    
    const socket1 = Client(BASE_URL, { auth: { token: TOKEN1 } });
    const socket2 = Client(BASE_URL, { auth: { token: TOKEN2 } });

    // Set up event listeners for socket1
    socket1.on('connect', () => {
      console.log('✅ User 1 WebSocket connected');
    });

    socket1.on('new_message', (data) => {
      console.log('📨 User 1 received new message:', data);
    });

    socket1.on('error', (error) => {
      console.error('❌ User 1 WebSocket error:', error);
    });

    // Set up event listeners for socket2
    socket2.on('connect', () => {
      console.log('✅ User 2 WebSocket connected');
    });

    socket2.on('new_message', (data) => {
      console.log('📨 User 2 received new message:', data);
    });

    socket2.on('error', (error) => {
      console.error('❌ User 2 WebSocket error:', error);
    });

    // Wait for both connections
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Send message via API
    console.log('\n📤 Test 3: Sending message via API...');
    
    if (conversations1.data.conversations.length > 0) {
      const conversationId = conversations1.data.conversations[0].id;
      
      const messageResponse = await axios.post(
        `${BASE_URL}/api/v1/chats/${conversationId}/messages`,
        { message: 'Hello from API test!' },
        { headers: { 'Authorization': `Bearer ${TOKEN1}` } }
      );
      
      console.log('✅ Message sent via API:', messageResponse.data);
    }

    // Test 4: Send message via WebSocket
    console.log('\n📤 Test 4: Sending message via WebSocket...');
    
    if (conversations1.data.conversations.length > 0) {
      const conversationId = conversations1.data.conversations[0].id;
      
      socket1.emit('send_message', {
        conversationId,
        message: 'Hello from WebSocket test!'
      });
    }

    // Wait for messages to be processed
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 5: Get messages to verify they were saved
    console.log('\n📋 Test 5: Getting messages...');
    
    if (conversations1.data.conversations.length > 0) {
      const conversationId = conversations1.data.conversations[0].id;
      
      const messagesResponse = await axios.get(
        `${BASE_URL}/api/v1/chats/${conversationId}/messages`,
        { headers: { 'Authorization': `Bearer ${TOKEN1}` } }
      );
      
      console.log('✅ Messages retrieved:', messagesResponse.data.messages.length);
      messagesResponse.data.messages.forEach((msg: any, index: number) => {
        console.log(`  ${index + 1}. ${msg.text} (${msg.timestamp})`);
      });
    }

    // Clean up
    setTimeout(() => {
      console.log('\n🔄 Cleaning up connections...');
      socket1.disconnect();
      socket2.disconnect();
      process.exit(0);
    }, 5000);

  } catch (error: any) {
    console.error('❌ Error in real-time chat test:', error.response?.data || error.message);
  }
}

testRealTimeChat(); 
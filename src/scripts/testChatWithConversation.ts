import axios from 'axios';
import { io as Client } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000';
const TOKEN1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzNzI3NjI1LCJleHAiOjE3NTQxNTk2MjV9.sT6crFmHnsM8za-NJIaP5ph2mVuVkVY-RMuJL99SzJo';
const TOKEN2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE2LCJ1c2VybmFtZSI6Im5pc2FyZ3BhdGVsXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6Im5pc2FyZ3BhdGVsXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzNzI3NjI1LCJleHAiOjE3NTQxNTk2MjV9.sT6crFmHnsM8za-NJIaP5ph2mVuVkVY-RMuJL99SzJo';

async function testChatWithConversation() {
  console.log('🧪 Testing Chat with Conversation Creation...\n');

  try {
    // Step 1: Get or create conversation between users
    console.log('📋 Step 1: Getting/Creating conversation...');
    
    const conversationResponse = await axios.get(`${BASE_URL}/api/v1/chats/conversation/16`, {
      headers: { 'Authorization': `Bearer ${TOKEN1}` }
    });
    
    console.log('✅ Conversation:', conversationResponse.data);
    const conversationId = conversationResponse.data.conversation.id;

    // Step 2: Create WebSocket connections
    console.log('\n🔌 Step 2: Creating WebSocket connections...');
    
    const socket1 = Client(BASE_URL, { auth: { token: TOKEN1 } });
    const socket2 = Client(BASE_URL, { auth: { token: TOKEN2 } });

    // Set up event listeners for socket1
    socket1.on('connect', () => {
      console.log('✅ User 1 WebSocket connected');
    });

    socket1.on('new_message', (data) => {
      console.log('📨 User 1 received new message:', data);
    });

    socket1.on('message_sent', (data) => {
      console.log('✅ User 1 message sent confirmation:', data);
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

    socket2.on('message_sent', (data) => {
      console.log('✅ User 2 message sent confirmation:', data);
    });

    socket2.on('error', (error) => {
      console.error('❌ User 2 WebSocket error:', error);
    });

    // Wait for both connections
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Send message via API
    console.log('\n📤 Step 3: Sending message via API...');
    
    const apiMessageResponse = await axios.post(
      `${BASE_URL}/api/v1/chats/${conversationId}/messages`,
      { message: 'Hello from API test!' },
      { headers: { 'Authorization': `Bearer ${TOKEN1}` } }
    );
    
    console.log('✅ API message sent:', apiMessageResponse.data);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Send message via WebSocket
    console.log('\n📤 Step 4: Sending message via WebSocket...');
    
    socket1.emit('send_message', {
      conversationId,
      message: 'Hello from WebSocket test!'
    });

    // Wait for WebSocket message to be processed
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 5: Get messages to verify they were saved
    console.log('\n📋 Step 5: Getting messages...');
    
    const messagesResponse = await axios.get(
      `${BASE_URL}/api/v1/chats/${conversationId}/messages`,
      { headers: { 'Authorization': `Bearer ${TOKEN1}` } }
    );
    
    console.log('✅ Messages retrieved:', messagesResponse.data.messages.length);
    messagesResponse.data.messages.forEach((msg: any, index: number) => {
      console.log(`  ${index + 1}. ${msg.text} (${msg.timestamp})`);
    });

    // Clean up
    setTimeout(() => {
      console.log('\n🔄 Cleaning up connections...');
      socket1.disconnect();
      socket2.disconnect();
      process.exit(0);
    }, 5000);

  } catch (error: any) {
    console.error('❌ Error in chat test:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    if (error.request) {
      console.error('Request error:', error.request);
    }
  }
}

testChatWithConversation(); 
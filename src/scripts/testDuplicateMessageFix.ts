import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000';
const TOKEN1 = ''; // Add your test token here
const TOKEN2 = ''; // Add your test token here

async function testDuplicateMessageFix() {
  console.log('🧪 Testing Duplicate Message Fix...\n');

  try {
    // Step 1: Create a conversation
    console.log('📋 Step 1: Creating conversation...');
    
    const conversationResponse = await axios.get(
      `${BASE_URL}/api/v1/chats/conversation/2`, // Assuming user ID 2 exists
      { headers: { 'Authorization': `Bearer ${TOKEN1}` } }
    );
    
    const conversationId = conversationResponse.data.conversation.id;
    console.log('✅ Conversation created:', conversationId);

    // Step 2: Send message via HTTP API
    console.log('\n📤 Step 2: Sending message via HTTP API...');
    
    const apiMessageResponse = await axios.post(
      `${BASE_URL}/api/v1/chats/${conversationId}/messages`,
      { message: 'Test message via HTTP API' },
      { headers: { 'Authorization': `Bearer ${TOKEN1}` } }
    );
    
    console.log('✅ HTTP API message sent:', apiMessageResponse.data.message.id);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Get messages to check for duplicates
    console.log('\n📋 Step 3: Getting messages to check for duplicates...');
    
    const messagesResponse = await axios.get(
      `${BASE_URL}/api/v1/chats/${conversationId}/messages`,
      { headers: { 'Authorization': `Bearer ${TOKEN1}` } }
    );
    
    console.log('✅ Messages retrieved:', messagesResponse.data.messages.length);
    
    // Check for duplicates
    const messageTexts = messagesResponse.data.messages.map((msg: any) => msg.text);
    const uniqueTexts = [...new Set(messageTexts)];
    
    if (messageTexts.length === uniqueTexts.length) {
      console.log('✅ No duplicate messages found!');
    } else {
      console.log('❌ Duplicate messages found!');
      console.log('All messages:', messageTexts);
      console.log('Unique messages:', uniqueTexts);
    }

    // Step 4: Test WebSocket connection (should not create database records)
    console.log('\n📤 Step 4: Testing WebSocket connection...');
    
    const socket1 = io(BASE_URL, {
      auth: { token: TOKEN1 }
    });

    socket1.on('connect', () => {
      console.log('✅ WebSocket connected');
      
      // Send message via WebSocket (should not create database record)
      socket1.emit('send_message', {
        conversationId,
        message: 'Test message via WebSocket (should not be saved)'
      });
    });

    socket1.on('message_sent', (data) => {
      console.log('✅ WebSocket message sent confirmation:', data);
    });

    socket1.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    // Wait for WebSocket message
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 5: Check messages again to ensure WebSocket didn't create duplicates
    console.log('\n📋 Step 5: Checking messages again...');
    
    const messagesResponse2 = await axios.get(
      `${BASE_URL}/api/v1/chats/${conversationId}/messages`,
      { headers: { 'Authorization': `Bearer ${TOKEN1}` } }
    );
    
    console.log('✅ Messages after WebSocket test:', messagesResponse2.data.messages.length);
    
    // Check for duplicates again
    const messageTexts2 = messagesResponse2.data.messages.map((msg: any) => msg.text);
    const uniqueTexts2 = [...new Set(messageTexts2)];
    
    if (messageTexts2.length === uniqueTexts2.length) {
      console.log('✅ No duplicate messages found after WebSocket test!');
      console.log('🎉 Duplicate message issue is FIXED!');
    } else {
      console.log('❌ Duplicate messages still found after WebSocket test!');
      console.log('All messages:', messageTexts2);
      console.log('Unique messages:', uniqueTexts2);
    }

    // Clean up
    setTimeout(() => {
      console.log('\n🧹 Cleaning up...');
      socket1.disconnect();
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDuplicateMessageFix(); 
import { io as Client } from 'socket.io-client';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;

// Test user token (Ankit - valid token)
const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM4LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0ODU3MDU4LCJleHAiOjE3NTUyODkwNTh9.LONTTE4Nzuc5z4FlFSTLcC3IneriUs68zFXbws_mvKg';

const testGroupId = 4;

async function testSingleUserRealTime() {
  console.log('🧪 Testing Single User Real-Time Communication...\n');
  console.log(`📋 Testing group ID: ${testGroupId}\n`);

  let socket: any = null;
  let receivedMessages: any[] = [];

  try {
    // Step 1: Connect to WebSocket
    console.log('🔌 Connecting to WebSocket...');
    
    socket = Client(BASE_URL, {
      auth: {
        token: USER_TOKEN
      },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log(`✅ Connected to WebSocket (Socket ID: ${socket.id})`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Disconnected from WebSocket`);
    });

    socket.on('connect_error', (error: any) => {
      console.error(`❌ Connection error:`, error.message);
    });

    socket.on('group-message', (data: any) => {
      console.log(`📨 Received group message:`, data.message.content);
      receivedMessages.push(data);
    });

    // Wait for connection
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      socket.on('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      socket.on('connect_error', (error: any) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    // Step 2: Join the group
    console.log('👥 Joining group...');
    socket.emit('join-group', { groupId: testGroupId });
    console.log(`✅ Joined group ${testGroupId}`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Send a message via API
    console.log('📤 Sending message via API...');
    const testMessage = `Single user test message at ${new Date().toLocaleTimeString()}`;
    
    const response = await axios.post(
      `${API_BASE}/groups/${testGroupId}/messages`,
      { content: testMessage },
      {
        headers: {
          'Authorization': `Bearer ${USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log(`✅ Message sent successfully via API`);
      console.log(`📤 API Response:`, response.data.message);
    } else {
      console.log(`❌ Failed to send message:`, response.data.message);
    }

    // Step 4: Wait and check if message was received via WebSocket
    console.log('⏳ Waiting for WebSocket message...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log(`📊 Received ${receivedMessages.length} messages via WebSocket`);
    receivedMessages.forEach((msg, index) => {
      console.log(`  ${index + 1}. "${msg.message.content}" from ${msg.message.senderName}`);
    });

    if (receivedMessages.length > 0) {
      console.log('✅ Real-time communication is working!');
    } else {
      console.log('❌ No messages received via WebSocket');
    }

    // Step 5: Test typing indicators
    console.log('\n⌨️  Testing typing indicators...');
    socket.emit('group-typing-start', { groupId: testGroupId });
    console.log('⌨️  Started typing');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    socket.emit('group-typing-stop', { groupId: testGroupId });
    console.log('⏹️  Stopped typing');

    // Step 6: Cleanup
    console.log('\n🧹 Cleaning up...');
    socket.emit('leave-group', { groupId: testGroupId });
    socket.disconnect();
    console.log('✅ Cleanup completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSingleUserRealTime().then(() => {
  console.log('\n🎉 Single user real-time test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Test failed:', error);
  process.exit(1);
});




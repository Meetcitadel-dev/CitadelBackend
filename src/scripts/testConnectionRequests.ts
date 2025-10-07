import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

// Mock user tokens (you'll need to replace these with actual tokens)
const USER1_TOKEN = 'your_user1_token_here';
const USER2_TOKEN = 'your_user2_token_here';

interface TestUser {
  id: number;
  name: string;
  token: string;
  socket?: Socket;
}

async function testConnectionRequestSystem() {
  console.log('🧪 Testing Real-time Connection Request System...\n');

  // Note: This test requires actual user tokens
  // You can get these by logging in as different users and copying the JWT tokens
  if (USER1_TOKEN === 'your_user1_token_here' || USER2_TOKEN === 'your_user2_token_here') {
    console.log('⚠️  Please update USER1_TOKEN and USER2_TOKEN with actual JWT tokens');
    console.log('   You can get these by:');
    console.log('   1. Logging in as User 1 in the frontend');
    console.log('   2. Opening browser dev tools > Application > Local Storage');
    console.log('   3. Copy the "authToken" value');
    console.log('   4. Repeat for User 2');
    console.log('   5. Update the tokens in this script\n');
    return;
  }

  const user1: TestUser = { id: 1, name: 'User 1', token: USER1_TOKEN };
  const user2: TestUser = { id: 2, name: 'User 2', token: USER2_TOKEN };

  try {
    // Test 1: Setup WebSocket connections for both users
    console.log('1️⃣ Setting up WebSocket connections...');
    
    user1.socket = io(BASE_URL, {
      auth: { token: user1.token },
      transports: ['websocket', 'polling']
    });

    user2.socket = io(BASE_URL, {
      auth: { token: user2.token },
      transports: ['websocket', 'polling']
    });

    // Wait for connections
    await new Promise((resolve) => {
      let connectedCount = 0;
      const checkConnections = () => {
        connectedCount++;
        if (connectedCount === 2) resolve(true);
      };

      user1.socket!.on('connect', () => {
        console.log(`   ${user1.name} WebSocket connected`);
        checkConnections();
      });

      user2.socket!.on('connect', () => {
        console.log(`   ${user2.name} WebSocket connected`);
        checkConnections();
      });
    });

    // Test 2: Set up event listeners for User 2 (recipient)
    console.log('\n2️⃣ Setting up event listeners for User 2...');
    
    const receivedEvents: any[] = [];

    user2.socket!.on('connection_request_received', (data) => {
      console.log(`   📨 User 2 received connection request:`, data);
      receivedEvents.push({ type: 'connection_request_received', data });
    });

    user1.socket!.on('connection_request_accepted', (data) => {
      console.log(`   ✅ User 1 received acceptance notification:`, data);
      receivedEvents.push({ type: 'connection_request_accepted', data });
    });

    user1.socket!.on('connection_request_rejected', (data) => {
      console.log(`   ❌ User 1 received rejection notification:`, data);
      receivedEvents.push({ type: 'connection_request_rejected', data });
    });

    // Test 3: User 1 sends connection request to User 2
    console.log('\n3️⃣ User 1 sending connection request to User 2...');
    
    const connectionResponse = await axios.post(
      `${BASE_URL}/api/v1/explore/manage-connection`,
      {
        targetUserId: user2.id,
        action: 'connect'
      },
      {
        headers: {
          'Authorization': `Bearer ${user1.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`   API Response: ${connectionResponse.data.message}`);
    console.log(`   Connection State:`, connectionResponse.data.connectionState);

    // Wait for WebSocket event
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 4: Check if User 2 received the real-time notification
    console.log('\n4️⃣ Checking real-time notifications...');
    
    const connectionRequestEvent = receivedEvents.find(e => e.type === 'connection_request_received');
    if (connectionRequestEvent) {
      console.log(`   ✅ User 2 received real-time connection request notification`);
      console.log(`   📋 Event data:`, connectionRequestEvent.data);
    } else {
      console.log(`   ❌ User 2 did not receive real-time notification`);
    }

    // Test 5: User 2 accepts the connection request
    if (connectionRequestEvent) {
      console.log('\n5️⃣ User 2 accepting connection request...');
      
      const acceptResponse = await axios.post(
        `${BASE_URL}/api/v1/notifications/handle-connection-request`,
        {
          requestId: connectionRequestEvent.data.id,
          action: 'accept'
        },
        {
          headers: {
            'Authorization': `Bearer ${user2.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`   API Response: ${acceptResponse.data.message}`);

      // Wait for WebSocket event
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if User 1 received acceptance notification
      const acceptanceEvent = receivedEvents.find(e => e.type === 'connection_request_accepted');
      if (acceptanceEvent) {
        console.log(`   ✅ User 1 received real-time acceptance notification`);
        console.log(`   📋 Event data:`, acceptanceEvent.data);
      } else {
        console.log(`   ❌ User 1 did not receive real-time acceptance notification`);
      }
    }

    // Test 6: Summary
    console.log('\n6️⃣ Test Summary:');
    console.log(`   Total events received: ${receivedEvents.length}`);
    console.log(`   Event types:`, receivedEvents.map(e => e.type));
    
    if (receivedEvents.length >= 2) {
      console.log(`   ✅ Real-time connection request system is working!`);
    } else {
      console.log(`   ⚠️  Some real-time events may not be working properly`);
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('\n❌ API test failed:');
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Message: ${error.response?.data?.message || error.message}`);
      console.error(`   URL: ${error.config?.url}`);
    } else {
      console.error('\n❌ Unexpected error:', error);
    }
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up WebSocket connections...');
    user1.socket?.disconnect();
    user2.socket?.disconnect();
  }
}

// Instructions for getting user tokens
console.log('📋 Instructions for running this test:');
console.log('1. Start the backend server: npm run dev');
console.log('2. Start the frontend: npm run dev');
console.log('3. Create two user accounts in the frontend');
console.log('4. Log in as User 1, copy the authToken from localStorage');
console.log('5. Log in as User 2, copy the authToken from localStorage');
console.log('6. Update USER1_TOKEN and USER2_TOKEN in this script');
console.log('7. Run this test: npm run test-connection-requests\n');

// Run the test
testConnectionRequestSystem().then(() => {
  console.log('\n🏁 Connection request test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test script error:', error);
  process.exit(1);
});

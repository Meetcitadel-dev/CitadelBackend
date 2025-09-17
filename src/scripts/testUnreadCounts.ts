import dotenv from 'dotenv';
dotenv.config();
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const WEBSOCKET_URL = 'http://localhost:3001';

interface TestUser {
  id: number;
  email: string;
  token: string;
  socket: Socket;
}

async function loginUser(email: string, password: string): Promise<{ token: string; user: any }> {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email,
      password
    });
    return response.data;
  } catch (error: any) {
    console.error(`Login failed for ${email}:`, error.response?.data || error.message);
    throw error;
  }
}

async function createTestUsers(): Promise<TestUser[]> {
  const users = [
    { email: 'testuser1@example.com', password: 'password123' },
    { email: 'testuser2@example.com', password: 'password123' },
    { email: 'testuser3@example.com', password: 'password123' }
  ];

  const testUsers: TestUser[] = [];

  for (const userCreds of users) {
    try {
      const { token, user } = await loginUser(userCreds.email, userCreds.password);
      
      const socket = io(WEBSOCKET_URL, {
        auth: { token },
        transports: ['websocket']
      });

      testUsers.push({
        id: user.id,
        email: user.email,
        token,
        socket
      });

      console.log(`✅ User ${user.email} logged in successfully`);
    } catch (error) {
      console.error(`❌ Failed to login user ${userCreds.email}`);
    }
  }

  return testUsers;
}

async function testUnreadCounts() {
  console.log('🧪 Starting Unread Count Test...\n');

  let users: TestUser[] = [];
  
  try {
    // Create test users
    users = await createTestUsers();
    
    if (users.length < 2) {
      console.error('❌ Need at least 2 users for testing');
      return;
    }

    const [user1, user2, user3] = users;

    // Wait for WebSocket connections
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n📡 Setting up WebSocket listeners...');

    // Set up unread count listeners for all users
    users.forEach(user => {
      user.socket.on('unread-count-update', (data) => {
        console.log(`📊 [${user.email}] Unread count update:`, data);
      });

      user.socket.on('group-message', (data) => {
        console.log(`💬 [${user.email}] Group message received:`, data.message.content);
      });

      user.socket.on('new_message', (data) => {
        console.log(`💬 [${user.email}] Direct message received:`, data.message.text);
      });
    });

    // Test 1: Create a group and send messages
    console.log('\n🧪 Test 1: Group Chat Unread Counts');
    
    // Create a group
    const createGroupResponse = await axios.post(
      `${BASE_URL}/api/v1/groups`,
      {
        name: 'Test Group',
        description: 'Test group for unread counts',
        memberIds: [user2.id, user3.id]
      },
      {
        headers: { Authorization: `Bearer ${user1.token}` }
      }
    );

    const groupId = createGroupResponse.data.group.id;
    console.log(`✅ Created group with ID: ${groupId}`);

    // User2 and User3 join the group
    user2.socket.emit('join-group', { groupId });
    user3.socket.emit('join-group', { groupId });
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // User1 sends a message to the group
    console.log('📤 User1 sending message to group...');
    await axios.post(
      `${BASE_URL}/api/v1/groups/${groupId}/messages`,
      { content: 'Hello from User1!' },
      {
        headers: { Authorization: `Bearer ${user1.token}` }
      }
    );

    await new Promise(resolve => setTimeout(resolve, 2000));

    // User2 sends a message to the group
    console.log('📤 User2 sending message to group...');
    await axios.post(
      `${BASE_URL}/api/v1/groups/${groupId}/messages`,
      { content: 'Hello from User2!' },
      {
        headers: { Authorization: `Bearer ${user2.token}` }
      }
    );

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Mark messages as read
    console.log('\n🧪 Test 2: Mark Messages as Read');
    
    // User3 marks messages as read
    console.log('📖 User3 marking messages as read...');
    await axios.post(
      `${BASE_URL}/api/v1/groups/${groupId}/messages/read`,
      {},
      {
        headers: { Authorization: `Bearer ${user3.token}` }
      }
    );

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Check unread counts via API
    console.log('\n🧪 Test 3: Check Unread Counts via API');
    
    const groupsResponse = await axios.get(
      `${BASE_URL}/api/v1/groups`,
      {
        headers: { Authorization: `Bearer ${user3.token}` }
      }
    );

    const group = groupsResponse.data.groups.find((g: any) => g.id === groupId);
    console.log(`📊 User3's unread count for group: ${group?.unreadCount || 0}`);

    console.log('\n✅ Unread Count Test Completed!');
    console.log('\n📋 Summary:');
    console.log('- Group messages should trigger unread count updates');
    console.log('- Marking messages as read should reset unread counts');
    console.log('- Unread counts should be reflected in API responses');
    console.log('- Real-time updates should be sent to user-specific rooms');

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    // Clean up
    if (users) {
      users.forEach(user => {
        user.socket.disconnect();
      });
      console.log('\n🧹 Cleaned up WebSocket connections');
    }
  }
}

// Run the test
testUnreadCounts().catch(console.error);

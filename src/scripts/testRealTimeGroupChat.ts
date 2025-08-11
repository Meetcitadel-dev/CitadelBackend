import { io as Client } from 'socket.io-client';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;

// Test user tokens (you may need to update these with valid tokens)
const USER1_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmdwYXRlbEBtYXN0ZXJzdW5pb24ub3JnIiwiaWF0IjoxNzU0ODU3NTEyLCJleHAiOjE3NTU2ODk1MTJ9.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';
const USER2_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM4LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0ODU3MDU4LCJleHAiOjE3NTUyODkwNTh9.LONTTE4Nzuc5z4FlFSTLcC3IneriUs68zFXbws_mvKg';

interface User {
  id: number;
  name: string;
  token: string;
  socket: any;
  receivedMessages: any[];
  receivedTypingEvents: any[];
}

class RealTimeGroupChatTest {
  private users: User[] = [];
  private testGroupId: number = 4; // Using group ID 4 as mentioned in the error

  constructor() {
    this.users = [
      {
        id: 30,
        name: 'Nisarg Patel',
        token: USER1_TOKEN,
        socket: null,
        receivedMessages: [],
        receivedTypingEvents: []
      },
      {
        id: 38,
        name: 'Ankit Kumar Ranjan',
        token: USER2_TOKEN,
        socket: null,
        receivedMessages: [],
        receivedTypingEvents: []
      }
    ];
  }

  async runTest() {
    console.log('🧪 Starting Real-Time Group Chat Test...\n');
    console.log(`📋 Testing group ID: ${this.testGroupId}\n`);

    try {
      // Step 1: Verify group exists and users are members
      await this.verifyGroupAccess();

      // Step 2: Connect both users to WebSocket
      await this.connectUsers();

      // Step 3: Both users join the group
      await this.joinGroup();

      // Step 4: User 1 sends a message via API
      await this.sendMessageViaAPI(0, 'Hello from Nisarg via API! 👋');

      // Step 5: Wait and check if message was received
      await this.wait(2000);
      this.checkReceivedMessages('After API message');

      // Step 6: User 2 sends a message via API
      await this.wait(1000);
      await this.sendMessageViaAPI(1, 'Hi Nisarg! How are you? 😊');

      // Step 7: Wait and check if message was received
      await this.wait(2000);
      this.checkReceivedMessages('After second API message');

      // Step 8: Test typing indicators
      await this.testTypingIndicators();

      // Step 9: Test direct WebSocket message sending
      await this.testDirectWebSocketMessage();

      // Step 10: Final check
      await this.wait(2000);
      this.checkReceivedMessages('Final check');

      // Step 11: Cleanup
      await this.cleanup();

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  private async verifyGroupAccess() {
    console.log('🔍 Verifying group access...');
    
    for (const user of this.users) {
      try {
        const response = await axios.get(`${API_BASE}/groups/${this.testGroupId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          console.log(`✅ User ${user.name} has access to group ${this.testGroupId}`);
        } else {
          console.log(`❌ User ${user.name} does not have access to group ${this.testGroupId}`);
        }
      } catch (error: any) {
        console.log(`❌ User ${user.name} cannot access group ${this.testGroupId}:`, error.response?.data?.message || error.message);
      }
    }
    console.log('');
  }

  private async connectUsers() {
    console.log('🔌 Connecting users to WebSocket...');

    for (let i = 0; i < this.users.length; i++) {
      const user = this.users[i];
      
      user.socket = Client(BASE_URL, {
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

      user.socket.on('connect_error', (error: any) => {
        console.error(`❌ User ${user.name} connection error:`, error.message);
      });

      user.socket.on('group-message', (data: any) => {
        console.log(`📨 User ${user.name} received group message:`, data.message.content);
        user.receivedMessages.push(data);
      });

      user.socket.on('group-user-typing', (data: any) => {
        console.log(`⌨️  User ${user.name} sees typing indicator from user ${data.userId}`);
        user.receivedTypingEvents.push(data);
      });

      user.socket.on('group-user-stopped-typing', (data: any) => {
        console.log(`⏹️  User ${user.name} sees typing stopped from user ${data.userId}`);
        user.receivedTypingEvents.push(data);
      });

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Connection timeout for ${user.name}`));
        }, 10000);

        user.socket.on('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        user.socket.on('connect_error', (error: any) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    }

    console.log('✅ All users connected!\n');
  }

  private async joinGroup() {
    console.log('👥 Users joining group...');

    for (const user of this.users) {
      user.socket.emit('join-group', { groupId: this.testGroupId });
      console.log(`✅ User ${user.name} joined group ${this.testGroupId}`);
    }

    await this.wait(1000);
    console.log('✅ All users joined the group!\n');
  }

  private async sendMessageViaAPI(userIndex: number, content: string) {
    const user = this.users[userIndex];
    console.log(`📤 User ${user.name} sending message via API: "${content}"`);

    try {
      const response = await axios.post(
        `${API_BASE}/groups/${this.testGroupId}/messages`,
        { content },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log(`✅ Message sent successfully by ${user.name}`);
        console.log(`📤 API Response:`, response.data.message);
      } else {
        console.log(`❌ Failed to send message:`, response.data.message);
      }
    } catch (error: any) {
      console.error(`❌ Error sending message:`, error.response?.data || error.message);
    }
  }

  private async testDirectWebSocketMessage() {
    console.log('\n📤 Testing direct WebSocket message sending...');
    
    const user = this.users[0];
    const message = 'Direct WebSocket message test! 🚀';
    
    user.socket.emit('send_message', {
      conversationId: `group_${this.testGroupId}`,
      message
    });
    
    console.log(`📤 User ${user.name} sent direct WebSocket message`);
    await this.wait(2000);
  }

  private async testTypingIndicators() {
    console.log('\n⌨️  Testing typing indicators...');

    // User 1 starts typing
    this.users[0].socket.emit('group-typing-start', { groupId: this.testGroupId });
    console.log(`⌨️  User ${this.users[0].name} started typing`);

    await this.wait(2000);

    // User 1 stops typing
    this.users[0].socket.emit('group-typing-stop', { groupId: this.testGroupId });
    console.log(`⏹️  User ${this.users[0].name} stopped typing`);

    await this.wait(1000);

    // User 2 starts typing
    this.users[1].socket.emit('group-typing-start', { groupId: this.testGroupId });
    console.log(`⌨️  User ${this.users[1].name} started typing`);

    await this.wait(2000);

    // User 2 stops typing
    this.users[1].socket.emit('group-typing-stop', { groupId: this.testGroupId });
    console.log(`⏹️  User ${this.users[1].name} stopped typing`);

    console.log('✅ Typing indicators test completed!\n');
  }

  private checkReceivedMessages(context: string) {
    console.log(`\n📊 Checking received messages (${context})...`);

    for (const user of this.users) {
      console.log(`\n📨 User ${user.name} received ${user.receivedMessages.length} messages:`);
      user.receivedMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. "${msg.message.content}" from ${msg.message.senderName}`);
      });
      
      console.log(`⌨️  User ${user.name} received ${user.receivedTypingEvents.length} typing events`);
    }

    // Verify that messages were received by other users
    const user1Messages = this.users[0].receivedMessages.length;
    const user2Messages = this.users[1].receivedMessages.length;

    console.log(`\n📈 Message delivery summary (${context}):`);
    console.log(`  User 1 (${this.users[0].name}): ${user1Messages} messages received`);
    console.log(`  User 2 (${this.users[1].name}): ${user2Messages} messages received`);

    if (user1Messages > 0 && user2Messages > 0) {
      console.log('✅ Real-time messaging is working correctly!');
    } else {
      console.log('❌ Real-time messaging may have issues');
    }
  }

  private async cleanup() {
    console.log('\n🧹 Cleaning up...');

    for (const user of this.users) {
      if (user.socket) {
        user.socket.emit('leave-group', { groupId: this.testGroupId });
        user.socket.disconnect();
      }
    }

    console.log('✅ Cleanup completed!');
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the test
const test = new RealTimeGroupChatTest();
test.runTest().then(() => {
  console.log('\n🎉 Real-time group chat test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Test failed:', error);
  process.exit(1);
});


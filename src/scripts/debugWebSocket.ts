import { io as Client } from 'socket.io-client';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;

// Fresh tokens from the user's request
const NISARG_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';
const ANKIT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM4LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0ODU3MDU4LCJleHAiOjE3NTUyODkwNTh9.LONTTE4Nzuc5z4FlFSTLcC3IneriUs68zFXbws_mvKg';

class WebSocketDebugger {
  private nisargSocket: any;
  private ankitSocket: any;
  private testGroupId: number = 4;

  async runDebug() {
    console.log('🔧 WebSocket Debug Session Starting...\n');

    try {
      // Step 1: Connect both users
      await this.connectUsers();

      // Step 2: Join group and test room membership
      await this.testGroupRoom();

      // Step 3: Test direct WebSocket emission
      await this.testDirectEmission();

      // Step 4: Test API message sending
      await this.testAPIMessage();

      // Step 5: Cleanup
      await this.cleanup();

    } catch (error) {
      console.error('❌ Debug failed:', error);
    }
  }

  private async connectUsers() {
    console.log('🔌 Connecting users to WebSocket...');

    // Connect Nisarg
    this.nisargSocket = Client(BASE_URL, {
      auth: { token: NISARG_TOKEN },
      transports: ['websocket', 'polling']
    });

    this.nisargSocket.on('connect', () => {
      console.log(`✅ Nisarg connected (Socket ID: ${this.nisargSocket.id})`);
    });

    this.nisargSocket.on('group-message', (data: any) => {
      console.log(`📨 Nisarg received group message:`, data);
    });

    this.nisargSocket.on('group-user-typing', (data: any) => {
      console.log(`⌨️  Nisarg sees typing:`, data);
    });

    // Connect Ankit
    this.ankitSocket = Client(BASE_URL, {
      auth: { token: ANKIT_TOKEN },
      transports: ['websocket', 'polling']
    });

    this.ankitSocket.on('connect', () => {
      console.log(`✅ Ankit connected (Socket ID: ${this.ankitSocket.id})`);
    });

    this.ankitSocket.on('group-message', (data: any) => {
      console.log(`📨 Ankit received group message:`, data);
    });

    this.ankitSocket.on('group-user-typing', (data: any) => {
      console.log(`⌨️  Ankit sees typing:`, data);
    });

    // Wait for both connections
    await Promise.all([
      new Promise<void>((resolve) => {
        this.nisargSocket.on('connect', () => resolve());
      }),
      new Promise<void>((resolve) => {
        this.ankitSocket.on('connect', () => resolve());
      })
    ]);

    console.log('✅ Both users connected!\n');
  }

  private async testGroupRoom() {
    console.log('👥 Testing group room membership...');

    // Both users join the group
    this.nisargSocket.emit('join-group', { groupId: this.testGroupId });
    this.ankitSocket.emit('join-group', { groupId: this.testGroupId });

    console.log(`✅ Both users joined group ${this.testGroupId}`);

    // Wait a bit for room joining
    await this.wait(2000);

    // Test typing indicators
    console.log('⌨️  Testing typing indicators...');
    this.nisargSocket.emit('group-typing-start', { groupId: this.testGroupId });
    
    await this.wait(2000);
    
    this.nisargSocket.emit('group-typing-stop', { groupId: this.testGroupId });
    
    console.log('✅ Typing indicators test completed\n');
  }

  private async testDirectEmission() {
    console.log('📡 Testing direct WebSocket emission...');

    // Test message that should be received by both users
    const testMessage = {
      groupId: this.testGroupId,
      message: {
        id: 999,
        groupId: this.testGroupId,
        senderId: 30,
        senderName: 'Nisarg Patel',
        senderAvatar: null,
        content: 'Direct WebSocket test message',
        timestamp: new Date(),
        isEdited: false,
        editedAt: null
      }
    };

    console.log('📤 Emitting test message to group room...');
    
    // This should trigger the emitToGroup method
    // We'll test this by sending a message via API which calls emitToGroup
    try {
      const response = await axios.post(
        `${API_BASE}/groups/${this.testGroupId}/messages`,
        { content: 'Direct WebSocket test message' },
        {
          headers: {
            'Authorization': `Bearer ${NISARG_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log('✅ API message sent successfully');
        console.log('📤 Message should have been broadcast via WebSocket');
      }
    } catch (error: any) {
      console.error('❌ API message failed:', error.response?.data || error.message);
    }

    // Wait for WebSocket messages
    await this.wait(3000);
    console.log('✅ Direct emission test completed\n');
  }

  private async testAPIMessage() {
    console.log('📤 Testing API message sending...');

    try {
      const response = await axios.post(
        `${API_BASE}/groups/${this.testGroupId}/messages`,
        { content: 'API test message from debug script' },
        {
          headers: {
            'Authorization': `Bearer ${ANKIT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log('✅ API message sent successfully');
        console.log('📤 Message data:', {
          id: response.data.message.id,
          content: response.data.message.content,
          senderName: response.data.message.senderName
        });
      }
    } catch (error: any) {
      console.error('❌ API message failed:', error.response?.data || error.message);
    }

    // Wait for WebSocket messages
    await this.wait(3000);
    console.log('✅ API message test completed\n');
  }

  private async cleanup() {
    console.log('🧹 Cleaning up...');

    if (this.nisargSocket) {
      this.nisargSocket.emit('leave-group', { groupId: this.testGroupId });
      this.nisargSocket.disconnect();
    }

    if (this.ankitSocket) {
      this.ankitSocket.emit('leave-group', { groupId: this.testGroupId });
      this.ankitSocket.disconnect();
    }

    console.log('✅ Cleanup completed!');
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the debug
const wsDebugger = new WebSocketDebugger();
wsDebugger.runDebug().then(() => {
  console.log('\n🎉 WebSocket debug session completed!');
  process.exit(0);
}).catch((error: any) => {
  console.error('\n💥 Debug failed:', error);
  process.exit(1);
});


import { io as Client } from 'socket.io-client';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;

// Fresh tokens from the user's request
const NISARG_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';
const ANKIT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM4LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0ODU3MDU4LCJleHAiOjE3NTUyODkwNTh9.LONTTE4Nzuc5z4FlFSTLcC3IneriUs68zFXbws_mvKg';

class DetailedWebSocketDebugger {
  private nisargSocket: any;
  private ankitSocket: any;
  private testGroupId: number = 4;
  private nisargReceivedMessages: any[] = [];
  private ankitReceivedMessages: any[] = [];

  async runDebug() {
    console.log('🔧 Detailed WebSocket Debug Session Starting...\n');

    try {
      // Step 1: Connect both users
      await this.connectUsers();

      // Step 2: Join group and test room membership
      await this.testGroupRoom();

      // Step 3: Test API message sending with detailed logging
      await this.testAPIMessageWithLogging();

      // Step 4: Check results
      this.checkResults();

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
      this.nisargReceivedMessages.push(data);
    });

    this.nisargSocket.on('group-user-typing', (data: any) => {
      console.log(`⌨️  Nisarg sees typing:`, data);
    });

    this.nisargSocket.on('group-user-stopped-typing', (data: any) => {
      console.log(`⏹️  Nisarg sees typing stopped:`, data);
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
      this.ankitReceivedMessages.push(data);
    });

    this.ankitSocket.on('group-user-typing', (data: any) => {
      console.log(`⌨️  Ankit sees typing:`, data);
    });

    this.ankitSocket.on('group-user-stopped-typing', (data: any) => {
      console.log(`⏹️  Ankit sees typing stopped:`, data);
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

  private async testAPIMessageWithLogging() {
    console.log('📤 Testing API message sending with detailed logging...');

    try {
      console.log('📤 Sending message via API...');
      const response = await axios.post(
        `${API_BASE}/groups/${this.testGroupId}/messages`,
        { content: 'Detailed debug test message' },
        {
          headers: {
            'Authorization': `Bearer ${NISARG_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log('✅ API message sent successfully');
        console.log('📤 Message data:', {
          id: response.data.message.id,
          content: response.data.message.content,
          senderName: response.data.message.senderName,
          timestamp: response.data.message.timestamp
        });
        
        console.log('📤 This should have triggered emitToGroup in the backend');
        console.log('📤 Waiting for WebSocket messages...');
      }
    } catch (error: any) {
      console.error('❌ API message failed:', error.response?.data || error.message);
    }

    // Wait for WebSocket messages
    await this.wait(5000);
    console.log('✅ API message test completed\n');
  }

  private checkResults() {
    console.log('\n📊 Detailed Results Analysis:');
    console.log('================================');
    
    console.log(`📨 Nisarg received: ${this.nisargReceivedMessages.length} messages`);
    this.nisargReceivedMessages.forEach((msg, index) => {
      console.log(`  ${index + 1}. "${msg.message.content}" from ${msg.message.senderName}`);
    });
    
    console.log(`📨 Ankit received: ${this.ankitReceivedMessages.length} messages`);
    this.ankitReceivedMessages.forEach((msg, index) => {
      console.log(`  ${index + 1}. "${msg.message.content}" from ${msg.message.senderName}`);
    });

    console.log('\n🔍 Analysis:');
    if (this.nisargReceivedMessages.length === 0 && this.ankitReceivedMessages.length === 0) {
      console.log('❌ NO MESSAGES RECEIVED');
      console.log('🔧 This confirms the WebSocket broadcasting is broken');
      console.log('🔧 The issue is in the emitToGroup method or room management');
      console.log('🔧 Messages are being sent via API but not broadcast via WebSocket');
    } else if (this.nisargReceivedMessages.length > 0 && this.ankitReceivedMessages.length > 0) {
      console.log('✅ MESSAGES RECEIVED - WebSocket broadcasting is working');
    } else {
      console.log('⚠️  PARTIAL MESSAGES - Some users received messages');
      console.log('🔧 This might be a timing issue or partial room membership');
    }

    console.log('\n🔧 Next Steps:');
    console.log('1. Check server logs for emitToGroup calls');
    console.log('2. Verify room membership in Socket.io');
    console.log('3. Check if emitToGroup method is being called');
    console.log('4. Verify the room name format (group_4)');
  }

  private async cleanup() {
    console.log('\n🧹 Cleaning up...');

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
const wsDebugger = new DetailedWebSocketDebugger();
wsDebugger.runDebug().then(() => {
  console.log('\n🎉 Detailed WebSocket debug session completed!');
  process.exit(0);
}).catch((error: any) => {
  console.error('\n💥 Debug failed:', error);
  process.exit(1);
});
































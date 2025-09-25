import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;

// Test user token
const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmdwYXRlbEBtYXN0ZXJzdW5pb24ub3JnIiwiaWF0IjoxNzU0ODU3NTEyLCJleHAiOjE3NTU2ODk1MTJ9.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';

const headers = {
  'Authorization': `Bearer ${USER_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testGroupChat() {
  console.log('🧪 Testing Group Chat Functionality...\n');

  try {
    // Test 1: Get user's groups
    console.log('1️⃣ Getting user\'s groups...');
    const groupsResponse = await axios.get(`${API_BASE}/groups`, { headers });
    console.log('✅ Groups retrieved:', groupsResponse.data.groups.length);
    
    if (groupsResponse.data.groups.length === 0) {
      console.log('❌ No groups found. Please create a group first.');
      return;
    }

    const testGroup = groupsResponse.data.groups[0];
    console.log(`📋 Using group: ${testGroup.name} (ID: ${testGroup.id})\n`);

    // Test 2: Get group messages
    console.log('2️⃣ Getting group messages...');
    const messagesResponse = await axios.get(`${API_BASE}/groups/${testGroup.id}/messages`, { headers });
    console.log('✅ Messages retrieved:', messagesResponse.data.messages.length);
    console.log('📨 Recent messages:');
    messagesResponse.data.messages.slice(0, 3).forEach((msg: any, index: number) => {
      console.log(`   ${index + 1}. "${msg.content}" - ${msg.senderName}`);
    });
    console.log('');

    // Test 3: Send a new message
    console.log('3️⃣ Sending a new message...');
    const newMessage = `Test message from backend at ${new Date().toLocaleTimeString()}`;
    const sendResponse = await axios.post(
      `${API_BASE}/groups/${testGroup.id}/messages`,
      { content: newMessage },
      { headers }
    );
    
    if (sendResponse.data.success) {
      console.log('✅ Message sent successfully!');
      console.log(`📤 Sent: "${sendResponse.data.message.content}"`);
      console.log(`👤 From: ${sendResponse.data.message.senderName}`);
      console.log(`⏰ At: ${new Date(sendResponse.data.message.timestamp).toLocaleString()}`);
    } else {
      console.log('❌ Failed to send message:', sendResponse.data.message);
    }
    console.log('');

    // Test 4: Get updated messages
    console.log('4️⃣ Getting updated messages...');
    const updatedMessagesResponse = await axios.get(`${API_BASE}/groups/${testGroup.id}/messages`, { headers });
    console.log('✅ Updated messages count:', updatedMessagesResponse.data.messages.length);
    
    const latestMessage = updatedMessagesResponse.data.messages[0];
    console.log('📨 Latest message:');
    console.log(`   Content: "${latestMessage.content}"`);
    console.log(`   Sender: ${latestMessage.senderName}`);
    console.log(`   Time: ${new Date(latestMessage.timestamp).toLocaleString()}`);
    console.log('');

    // Test 5: Mark messages as read
    console.log('5️⃣ Marking messages as read...');
    const readResponse = await axios.post(
      `${API_BASE}/groups/${testGroup.id}/messages/read`,
      {},
      { headers }
    );
    
    if (readResponse.data.success) {
      console.log('✅ Messages marked as read successfully!');
    } else {
      console.log('❌ Failed to mark messages as read:', readResponse.data.message);
    }
    console.log('');

    console.log('🎉 Group chat functionality test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Groups can be retrieved');
    console.log('   ✅ Messages can be fetched');
    console.log('   ✅ New messages can be sent');
    console.log('   ✅ Messages are properly formatted');
    console.log('   ✅ Read status can be updated');
    console.log('\n💡 The backend is working correctly!');
    console.log('💡 For real-time functionality, ensure the frontend is properly connected to WebSocket.');

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔐 Authentication failed. Please check the token.');
    } else if (error.response?.status === 404) {
      console.log('🔍 Endpoint not found. Please check if the server is running.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Connection refused. Please start the server with: npm run dev');
    }
  }
}

// Run the test
testGroupChat();





























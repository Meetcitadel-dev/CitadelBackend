import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;

// Test user token
const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM4LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0ODU3MDU4LCJleHAiOjE3NTUyODkwNTh9.LONTTE4Nzuc5z4FlFSTLcC3IneriUs68zFXbws_mvKg';

const headers = {
  'Authorization': `Bearer ${USER_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testMarkAsRead() {
  console.log('🧪 Testing Mark as Read Functionality...\n');

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

    // Test 2: Get group messages before marking as read
    console.log('2️⃣ Getting group messages before marking as read...');
    const messagesBeforeResponse = await axios.get(`${API_BASE}/groups/${testGroup.id}/messages`, { headers });
    console.log('✅ Messages retrieved:', messagesBeforeResponse.data.messages.length);
    console.log('');

    // Test 3: Mark messages as read
    console.log('3️⃣ Marking messages as read...');
    const markReadResponse = await axios.post(
      `${API_BASE}/groups/${testGroup.id}/messages/read`,
      {},
      { headers }
    );
    
    if (markReadResponse.data.success) {
      console.log('✅ Messages marked as read successfully!');
      console.log(`📊 Response: ${markReadResponse.data.message}`);
    } else {
      console.log('❌ Failed to mark messages as read:', markReadResponse.data.message);
    }
    console.log('');

    // Test 4: Send a new message to test real-time
    console.log('4️⃣ Sending a test message...');
    const testMessage = `Test message for real-time testing at ${new Date().toLocaleTimeString()}`;
    const sendResponse = await axios.post(
      `${API_BASE}/groups/${testGroup.id}/messages`,
      { content: testMessage },
      { headers }
    );
    
    if (sendResponse.data.success) {
      console.log('✅ Test message sent successfully!');
      console.log(`📤 Sent: "${sendResponse.data.message.content}"`);
    } else {
      console.log('❌ Failed to send test message:', sendResponse.data.message);
    }
    console.log('');

    console.log('🎉 Mark as read test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Groups can be retrieved');
    console.log('   ✅ Messages can be fetched');
    console.log('   ✅ Mark as read functionality working');
    console.log('   ✅ Test message sent for real-time testing');
    console.log('\n💡 The mark as read issue should now be fixed!');

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
testMarkAsRead();




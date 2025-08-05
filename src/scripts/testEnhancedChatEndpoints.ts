import axios from 'axios';

async function testEnhancedChatEndpoints() {
  try {
    console.log('🧪 Testing Enhanced Chat Endpoints...');
    
    // Nisarg's token (user 30)
    const nisargToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDM5NTAxNywiZXhwIjoxNzU0ODI3MDE3fQ.LpUQaTFoOnRMqDze7eCxE5vtUe1v3pQal6lZLr7uhcU';
    
    const headers = {
      'Authorization': `Bearer ${nisargToken}`,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Get enhanced matched conversations
    console.log('\n📝 Test 1: GET /api/v1/enhanced-chats/matches');
    try {
      const matchesResponse = await axios.get('http://localhost:3000/api/v1/enhanced-chats/matches', { headers });
      console.log('Status:', matchesResponse.status);
      console.log('Response:', JSON.stringify(matchesResponse.data, null, 2));
    } catch (error: any) {
      console.error('❌ Enhanced matches endpoint failed:', error.response?.data || error.message);
    }
    
    // Test 2: Check chat history with user 15
    console.log('\n📝 Test 2: GET /api/v1/enhanced-chats/chat-history/15');
    try {
      const chatHistoryResponse = await axios.get('http://localhost:3000/api/v1/enhanced-chats/chat-history/15', { headers });
      console.log('Status:', chatHistoryResponse.status);
      console.log('Response:', chatHistoryResponse.data);
    } catch (error: any) {
      console.error('❌ Chat history endpoint failed:', error.response?.data || error.message);
    }
    
    // Test 3: Send connection request (Case 3)
    console.log('\n📝 Test 3: POST /api/v1/enhanced-chats/connection-request');
    try {
      const connectionRequestResponse = await axios.post('http://localhost:3000/api/v1/enhanced-chats/connection-request', {
        targetUserId: 25
      }, { headers });
      console.log('Status:', connectionRequestResponse.status);
      console.log('Response:', connectionRequestResponse.data);
    } catch (error: any) {
      console.error('❌ Connection request endpoint failed:', error.response?.data || error.message);
    }
    
    // Test 4: Dismiss match prompt
    console.log('\n📝 Test 4: POST /api/v1/enhanced-chats/dismiss');
    try {
      const dismissResponse = await axios.post('http://localhost:3000/api/v1/enhanced-chats/dismiss', {
        targetUserId: 15
      }, { headers });
      console.log('Status:', dismissResponse.status);
      console.log('Response:', dismissResponse.data);
    } catch (error: any) {
      console.error('❌ Dismiss endpoint failed:', error.response?.data || error.message);
    }
    
    // Test 5: Move chat to active section
    console.log('\n📝 Test 5: POST /api/v1/enhanced-chats/move-to-active');
    try {
      const moveToActiveResponse = await axios.post('http://localhost:3000/api/v1/enhanced-chats/move-to-active', {
        targetUserId: 15
      }, { headers });
      console.log('Status:', moveToActiveResponse.status);
      console.log('Response:', moveToActiveResponse.data);
    } catch (error: any) {
      console.error('❌ Move to active endpoint failed:', error.response?.data || error.message);
    }
    
    // Test 6: Send message (if conversation exists)
    console.log('\n📝 Test 6: POST /api/v1/enhanced-chats/send-message');
    try {
      const sendMessageResponse = await axios.post('http://localhost:3000/api/v1/enhanced-chats/send-message', {
        conversationId: '0d82c5c9-aa26-4119-9bd0-1bc62b671682', // Use existing conversation ID
        text: 'Test message from enhanced chat system'
      }, { headers });
      console.log('Status:', sendMessageResponse.status);
      console.log('Response:', sendMessageResponse.data);
    } catch (error: any) {
      console.error('❌ Send message endpoint failed:', error.response?.data || error.message);
    }
    
    console.log('\n✅ Enhanced chat endpoints test completed!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEnhancedChatEndpoints(); 
import axios from 'axios';

async function testConversationMessages() {
  try {
    console.log('🧪 Testing Conversation Messages...');
    
    // Ankit's token (user 15)
    const ankitToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
    
    const headers = {
      'Authorization': `Bearer ${ankitToken}`,
      'Content-Type': 'application/json'
    };
    
    // Test conversation messages
    console.log('\n📝 Testing GET /api/v1/chats/0d82c5c9-aa26-4119-9bd0-1bc62b671682/messages');
    try {
      const messagesResponse = await axios.get('http://localhost:3000/api/v1/chats/0d82c5c9-aa26-4119-9bd0-1bc62b671682/messages', { headers });
      console.log('Status:', messagesResponse.status);
      console.log('Response:', JSON.stringify(messagesResponse.data, null, 2));
    } catch (error: any) {
      console.error('❌ Conversation messages failed:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testConversationMessages(); 
import axios from 'axios';

async function testChatEndpoints() {
  try {
    console.log('🧪 Testing Chat Endpoints...');
    
    // Nisarg's token (user 30)
    const nisargToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDM5NTAxNywiZXhwIjoxNzU0ODI3MDE3fQ.LpUQaTFoOnRMqDze7eCxE5vtUe1v3pQal6lZLr7uhcU';
    
    const headers = {
      'Authorization': `Bearer ${nisargToken}`,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Get matched conversations
    console.log('\n📝 Test 1: GET /api/v1/chats/matches');
    try {
      const matchesResponse = await axios.get('http://localhost:3000/api/v1/chats/matches', { headers });
      console.log('Status:', matchesResponse.status);
      console.log('Response:', matchesResponse.data);
    } catch (error: any) {
      console.error('❌ Matches endpoint failed:', error.response?.data || error.message);
    }
    
    // Test 2: Get active conversations
    console.log('\n📝 Test 2: GET /api/v1/chats/active');
    try {
      const activeResponse = await axios.get('http://localhost:3000/api/v1/chats/active', { headers });
      console.log('Status:', activeResponse.status);
      console.log('Response:', activeResponse.data);
    } catch (error: any) {
      console.error('❌ Active endpoint failed:', error.response?.data || error.message);
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testChatEndpoints(); 
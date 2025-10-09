import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Use the JWT token from your frontend request
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';

async function testGroupsPost() {
  console.log('🧪 Testing POST /api/v1/groups endpoint...\n');

  try {
    // Test 1: Check if server is running
    console.log('✅ Test 1: Checking server status...');
    const testResponse = await axios.get(`${BASE_URL}/api/test`);
    console.log('✅ Server is running:', testResponse.data);

    // Test 2: Test POST groups endpoint with valid auth
    console.log('\n✅ Test 2: Testing POST /api/v1/groups with valid auth...');
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/groups`, {
        name: 'Test Group',
        description: 'Test group description',
        memberIds: []
      }, {
        headers: { 
          Authorization: `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ POST request successful!');
      console.log('Response:', response.data);
    } catch (error: any) {
      console.log('❌ POST request failed:', error.response?.status);
      console.log('Error message:', error.response?.data);
    }

    console.log('\n🎉 Groups POST endpoint test completed!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Server is not running. Start it with: npm run dev');
    }
  }
}

testGroupsPost();




































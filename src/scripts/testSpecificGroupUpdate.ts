import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Use the JWT token from your frontend request
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';

async function testSpecificGroupUpdate() {
  console.log('🧪 Testing PUT /api/v1/groups/3 (specific group that was failing)...\n');

  try {
    // Test 1: Check if server is running
    console.log('✅ Test 1: Checking server status...');
    const testResponse = await axios.get(`${BASE_URL}/api/test`);
    console.log('✅ Server is running:', testResponse.data);

    // Test 2: Update group ID 3 specifically
    console.log('\n✅ Test 2: Updating group ID 3...');
    try {
      const updateResponse = await axios.put(`${BASE_URL}/api/v1/groups/3`, {
        name: 'Group_Best_Buddies_Updated'
      }, {
        headers: { 
          Authorization: `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Update request successful!');
      console.log('Status:', updateResponse.status);
      console.log('Response:', updateResponse.data);
    } catch (error: any) {
      console.log('❌ Update request failed:', error.response?.status);
      console.log('Error message:', error.response?.data);
      
      if (error.response?.status === 404) {
        console.log('💡 Group ID 3 might not exist or user might not be admin');
      } else if (error.response?.status === 403) {
        console.log('💡 User might not be admin of this group');
      }
    }

    console.log('\n🎉 Specific group update test completed!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Server is not running. Start it with: npm run dev');
    }
  }
}

testSpecificGroupUpdate();

































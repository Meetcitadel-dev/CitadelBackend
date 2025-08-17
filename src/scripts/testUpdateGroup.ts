import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Use the JWT token from your frontend request
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';

async function testUpdateGroup() {
  console.log('🧪 Testing PUT /api/v1/groups/{groupId} endpoint...\n');

  try {
    // Test 1: Check if server is running
    console.log('✅ Test 1: Checking server status...');
    const testResponse = await axios.get(`${BASE_URL}/api/test`);
    console.log('✅ Server is running:', testResponse.data);

    // Test 2: Get user's groups first
    console.log('\n✅ Test 2: Getting user\'s groups...');
    try {
      const groupsResponse = await axios.get(`${BASE_URL}/api/v1/groups`, {
        headers: { Authorization: `Bearer ${JWT_TOKEN}` }
      });
      console.log('✅ Groups retrieved successfully!');
      console.log('Groups count:', groupsResponse.data.groups?.length || 0);
      
      if (groupsResponse.data.groups?.length > 0) {
        const firstGroup = groupsResponse.data.groups[0];
        console.log('First group:', firstGroup.name, 'ID:', firstGroup.id);
        
        // Test 3: Update the first group
        console.log('\n✅ Test 3: Updating group name...');
        const updateResponse = await axios.put(`${BASE_URL}/api/v1/groups/${firstGroup.id}`, {
          name: 'Updated Group Name Test'
        }, {
          headers: { 
            Authorization: `Bearer ${JWT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Update request successful!');
        console.log('Response:', updateResponse.data);
      } else {
        console.log('⚠️ No groups available to update');
      }
    } catch (error: any) {
      console.log('❌ Request failed:', error.response?.status);
      console.log('Error message:', error.response?.data);
      console.log('Full error:', error.response?.data);
    }

    console.log('\n🎉 Group update test completed!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Server is not running. Start it with: npm run dev');
    }
  }
}

testUpdateGroup();






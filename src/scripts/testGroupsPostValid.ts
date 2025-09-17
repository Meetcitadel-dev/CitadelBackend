import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Use the JWT token from your frontend request
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';

async function testGroupsPostValid() {
  console.log('🧪 Testing POST /api/v1/groups with valid data...\n');

  try {
    // Test 1: Check if server is running
    console.log('✅ Test 1: Checking server status...');
    const testResponse = await axios.get(`${BASE_URL}/api/test`);
    console.log('✅ Server is running:', testResponse.data);

    // Test 2: Get user connections first
    console.log('\n✅ Test 2: Getting user connections...');
    try {
      const connectionsResponse = await axios.get(`${BASE_URL}/api/v1/connections`, {
        headers: { Authorization: `Bearer ${JWT_TOKEN}` }
      });
      console.log('✅ Connections retrieved successfully!');
      console.log('Connections count:', connectionsResponse.data.connections?.length || 0);
      
      // Test 3: Test POST groups endpoint with valid data
      console.log('\n✅ Test 3: Testing POST /api/v1/groups with valid data...');
      const memberIds = connectionsResponse.data.connections?.slice(0, 2).map((conn: any) => conn.id) || [];
      
      if (memberIds.length > 0) {
        const response = await axios.post(`${BASE_URL}/api/v1/groups`, {
          name: 'Test Group from Backend',
          description: 'Test group created from backend script',
          memberIds: memberIds
        }, {
          headers: { 
            Authorization: `Bearer ${JWT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ POST request successful!');
        console.log('Group created:', response.data.group?.name);
        console.log('Group ID:', response.data.group?.id);
        console.log('Member count:', response.data.group?.memberCount);
      } else {
        console.log('⚠️ No connections available to create group with');
        console.log('This is expected if the user has no connections');
      }
    } catch (error: any) {
      console.log('❌ Request failed:', error.response?.status);
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

testGroupsPostValid();





















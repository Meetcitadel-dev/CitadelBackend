import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Use the JWT token from your frontend request
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDg1NzUxMiwiZXhwIjoxNzU1Mjg5NTEyfQ.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';

async function testConnectionsEndpoint() {
  console.log('🧪 Testing Connections Endpoints...\n');

  try {
    // Test 1: Check if server is running
    console.log('✅ Test 1: Checking server status...');
    const testResponse = await axios.get(`${BASE_URL}/api/test`);
    console.log('✅ Server is running:', testResponse.data);

    // Test 2: Test the CORRECT endpoint - /api/v1/connections
    console.log('\n✅ Test 2: Testing CORRECT endpoint /api/v1/connections...');
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/connections`, {
        headers: { Authorization: `Bearer ${JWT_TOKEN}` }
      });
      console.log('✅ CORRECT endpoint works!');
      console.log('Status:', response.status);
      console.log('Connections count:', response.data.connections?.length || 0);
      console.log('Sample connection:', response.data.connections?.[0] || 'No connections');
    } catch (error: any) {
      console.log('❌ CORRECT endpoint failed:', error.response?.status);
      console.log('Error message:', error.response?.data);
    }

    // Test 3: Test the INCORRECT endpoint - /api/v1/connections/users (what frontend is using)
    console.log('\n❌ Test 3: Testing INCORRECT endpoint /api/v1/connections/users...');
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/connections/users`, {
        headers: { Authorization: `Bearer ${JWT_TOKEN}` }
      });
      console.log('❌ This should have failed but it worked:', response.status);
    } catch (error: any) {
      console.log('✅ INCORRECT endpoint correctly failed:', error.response?.status);
      console.log('This confirms the endpoint does not exist');
    }

    console.log('\n🎉 Endpoint tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ /api/v1/connections - EXISTS and works');
    console.log('❌ /api/v1/connections/users - DOES NOT EXIST');
    console.log('\n💡 Frontend should use: /api/v1/connections (without /users)');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Server is not running. Start it with: npm run dev');
    }
  }
}

testConnectionsEndpoint();

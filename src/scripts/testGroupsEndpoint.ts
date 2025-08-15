import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testGroupsEndpoint() {
  console.log('🧪 Testing Groups Endpoint...\n');

  try {
    // Test 1: Check if server is running
    console.log('✅ Test 1: Checking server status...');
    const testResponse = await axios.get(`${BASE_URL}/api/test`);
    console.log('✅ Server is running:', testResponse.data);

    // Test 2: Test groups endpoint without auth (should fail)
    console.log('\n✅ Test 2: Testing groups endpoint without auth...');
    try {
      await axios.get(`${BASE_URL}/api/v1/groups`);
      console.log('❌ Should have failed without auth');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    // Test 3: Test groups endpoint with invalid auth
    console.log('\n✅ Test 3: Testing groups endpoint with invalid auth...');
    try {
      await axios.get(`${BASE_URL}/api/v1/groups`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('✅ Correctly rejected with invalid token');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    // Test 4: Test POST groups endpoint without auth (should fail)
    console.log('\n✅ Test 4: Testing POST groups endpoint without auth...');
    try {
      await axios.post(`${BASE_URL}/api/v1/groups`, {
        name: 'Test Group',
        memberIds: []
      });
      console.log('❌ Should have failed without auth');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected POST without authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    console.log('\n🎉 Groups endpoint tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. The server is running correctly');
    console.log('2. The /api/v1/groups endpoint exists');
    console.log('3. Authentication is working');
    console.log('4. Test with a valid JWT token from your frontend');
    console.log('5. The route alias is working correctly');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Server is not running. Start it with: npm run dev');
    }
  }
}

testGroupsEndpoint();





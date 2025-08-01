import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

async function testUserProfile() {
  try {
    // You'll need to replace these with actual test data
    const token = 'YOUR_TEST_TOKEN_HERE';
    const testUsername = 'testuser';

    console.log('Testing user profile endpoint...');
    
    const response = await axios.get(`${BASE_URL}/users/${testUsername}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Check if the new field names are present
    const data = response.data.data;
    if (data.connectionsCount !== undefined && data.mutualConnectionsCount !== undefined) {
      console.log('✅ Success: New field names are working!');
      console.log(`Connections Count: ${data.connectionsCount}`);
      console.log(`Mutual Connections Count: ${data.mutualConnectionsCount}`);
      console.log(`Connections Array Length: ${data.connections?.length || 0}`);
    } else {
      console.log('❌ Error: New field names not found in response');
    }

  } catch (error) {
    console.error('Error testing user profile:', error.response?.data || error.message);
  }
}

async function testMutualConnections() {
  try {
    const token = 'YOUR_TEST_TOKEN_HERE';
    const testUsername = 'testuser';

    console.log('\nTesting mutual connections endpoint...');
    
    const response = await axios.get(`${BASE_URL}/users/${testUsername}/mutual-friends`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Check if the new field names are present
    const data = response.data.data;
    if (data.mutualConnections !== undefined) {
      console.log('✅ Success: Mutual connections field name is working!');
      console.log(`Mutual Connections Count: ${data.totalCount}`);
    } else {
      console.log('❌ Error: Mutual connections field name not found in response');
    }

  } catch (error) {
    console.error('Error testing mutual connections:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Friends and Mutuals Functionality\n');
  
  await testUserProfile();
  await testMutualConnections();
  
  console.log('\n✅ Tests completed!');
}

runTests().catch(console.error); 
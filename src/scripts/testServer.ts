import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testServer() {
  console.log('🧪 Testing Server Connection...\n');

  try {
    // Test if server is running
    console.log('1. Testing server connection...');
    const response = await axios.get(`${BASE_URL}/api/v1/auth/check-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        email: 'test@university.edu'
      }
    });
    console.log('✅ Server is running and responding');
    console.log('Response:', response.data);
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first.');
      console.log('Run: npm start');
    } else if (error.response) {
      console.log('✅ Server is running but returned error:', error.response.data);
      console.log('Status:', error.response.status);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testServer().catch(console.error); 
import axios from 'axios';

async function testEndpoint() {
  try {
    console.log('🧪 Testing Grid View Endpoint...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1Mzk0NjA1MSwiZXhwIjoxNzU0Mzc4MDUxfQ.hIN-ModhzpR8893QBAauikyMKflwejXOA0q1sCvp7dQ';
    
    const response = await axios.get('http://localhost:3000/api/v1/users/gridview?limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Endpoint working!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    console.error('❌ Endpoint test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testEndpoint(); 
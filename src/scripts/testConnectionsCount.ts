import axios from 'axios';

const testConnectionsCount = async () => {
  try {
    // You'll need to replace this with a valid JWT token from a logged-in user
    const token = 'YOUR_JWT_TOKEN_HERE';
    
    const response = await axios.get('http://localhost:3000/api/v1/connections/count', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log(`✅ Connections count: ${response.data.connectionsCount}`);
    } else {
      console.log('❌ Failed to get connections count');
    }
    
  } catch (error: any) {
    console.error('Error testing connections count:', error.response?.data || error.message);
  }
};

testConnectionsCount(); 
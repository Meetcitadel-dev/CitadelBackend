import axios from 'axios';

async function testGridView() {
  try {
    console.log('🧪 Testing GridView API...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test gridview endpoint
    console.log('\n📡 Testing GET /api/v1/users/gridview');
    const response = await axios.get('http://localhost:3000/api/v1/users/gridview?limit=10', { headers });
    console.log(`Status: ${response.status}`);
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log(`✅ Found ${response.data.profiles?.length || 0} profiles`);
    } else {
      console.log('❌ GridView failed:', response.data.message);
    }
    
  } catch (error: any) {
    console.error('❌ GridView test failed:', error.response?.data || error.message);
  }
}

testGridView(); 
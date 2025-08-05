import axios from 'axios';

async function testOldAdjectiveEndpoint() {
  try {
    console.log('🧪 Testing Old Adjective Endpoint...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test old endpoint with "Disciplined"
    console.log('\n📝 Testing POST /api/v1/explore/adjectives/select with "Disciplined"');
    const response = await axios.post('http://localhost:3000/api/v1/explore/adjectives/select', {
      targetUserId: 30,
      adjective: 'Disciplined'
    }, { headers });
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ "Disciplined" is now accepted by the old endpoint');
    } else {
      console.log('❌ Still getting error:', response.data.message);
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testOldAdjectiveEndpoint(); 
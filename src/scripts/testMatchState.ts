import axios from 'axios';

async function testMatchState() {
  try {
    console.log('🧪 Testing Match State Endpoint...');
    
    // Ankit's token (user 15)
    const ankitToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
    
    const headers = {
      'Authorization': `Bearer ${ankitToken}`,
      'Content-Type': 'application/json'
    };
    
    // Test match state endpoint
    console.log('\n📝 Testing GET /api/v1/enhanced-explore/matches/state/30');
    try {
      const matchStateResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/matches/state/30', { headers });
      console.log('Status:', matchStateResponse.status);
      console.log('Response:', JSON.stringify(matchStateResponse.data, null, 2));
    } catch (error: any) {
      console.error('❌ Match state failed:', error.response?.data || error.message);
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMatchState(); 
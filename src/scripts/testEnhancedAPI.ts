import axios from 'axios';

async function testEnhancedAPI() {
  try {
    console.log('🧪 Testing Enhanced Adjective System API...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Get user gender
    console.log('\n👤 Testing GET /api/v1/enhanced-explore/profile/gender');
    const genderResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/profile/gender', { headers });
    console.log(`Status: ${genderResponse.status}`);
    console.log('Response:', genderResponse.data);
    
    // Test 2: Get available adjectives for user 30
    console.log('\n📝 Testing GET /api/v1/enhanced-explore/adjectives/available/30');
    const adjectivesResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/30', { headers });
    console.log(`Status: ${adjectivesResponse.status}`);
    console.log('Response:', adjectivesResponse.data);
    
    // Test 3: Select an adjective (using a valid adjective from the lists)
    console.log('\n✅ Testing POST /api/v1/enhanced-explore/adjectives/select');
    const selectResponse = await axios.post('http://localhost:3000/api/v1/enhanced-explore/adjectives/select', {
      targetUserId: 30,
      adjective: 'Smart' // Using a valid adjective from GENDER_NEUTRAL_ADJECTIVES
    }, { headers });
    console.log(`Status: ${selectResponse.status}`);
    console.log('Response:', selectResponse.data);
    
    // Test 4: Get match state
    console.log('\n🤝 Testing GET /api/v1/enhanced-explore/matches/state/30');
    const matchStateResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/matches/state/30', { headers });
    console.log(`Status: ${matchStateResponse.status}`);
    console.log('Response:', matchStateResponse.data);
    
    console.log('\n🎉 All API tests completed!');
    
  } catch (error: any) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testEnhancedAPI(); 
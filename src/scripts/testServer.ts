import axios from 'axios';

async function testServer() {
  try {
    console.log('🧪 Testing server connectivity...');
    
    // Test basic endpoint
    console.log('\n📡 Testing GET /api/test');
    const testResponse = await axios.get('http://localhost:3000/api/test');
    console.log(`Status: ${testResponse.status}`);
    console.log('Response:', testResponse.data);
    
    // Test enhanced explore endpoint
    console.log('\n📡 Testing GET /api/v1/enhanced-explore/profile/gender');
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const genderResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/profile/gender', { headers });
    console.log(`Status: ${genderResponse.status}`);
    console.log('Response:', genderResponse.data);
    
    console.log('\n🎉 Server is running and responding!');
    
  } catch (error: any) {
    console.error('❌ Server test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testServer(); 
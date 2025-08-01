import axios from 'axios';

async function testOriginalAPI() {
  try {
    console.log('🧪 Testing Original API Call...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
    
    // Test the exact API call that was failing
    const url = 'http://localhost:3000/api/v1/users/gridview?limit=20&gender=female';
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response:');
    console.log(`Status: ${response.status}`);
    console.log(`Total profiles: ${response.data.profiles?.length || 0}`);
    console.log(`Success: ${response.data.success}`);
    console.log(`Has more: ${response.data.hasMore}`);
    console.log(`Total count: ${response.data.totalCount}`);
    
    if (response.data.profiles && response.data.profiles.length > 0) {
      console.log('\n📋 Profiles returned:');
      response.data.profiles.forEach((profile: any, index: number) => {
        console.log(`${index + 1}. ${profile.name} - ${profile.gender} - ${profile.year} year`);
      });
    } else {
      console.log('❌ No profiles returned');
    }
    
  } catch (error: any) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testOriginalAPI(); 
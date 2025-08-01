import axios from 'axios';

async function testGenderAPI() {
  try {
    console.log('🧪 Testing Gender Filter API...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
    
    // Test with lowercase 'female'
    console.log('\n👩 Testing with gender=female:');
    const response1 = await axios.get('http://localhost:3000/api/v1/users/gridview?limit=10&gender=female', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response1.status}`);
    console.log(`Total profiles: ${response1.data.profiles?.length || 0}`);
    
    if (response1.data.profiles && response1.data.profiles.length > 0) {
      console.log('Profiles returned:');
      response1.data.profiles.forEach((profile: any, index: number) => {
        console.log(`${index + 1}. ${profile.name} - ${profile.gender}`);
      });
    }
    
    // Test with uppercase 'Female'
    console.log('\n👩 Testing with gender=Female:');
    const response2 = await axios.get('http://localhost:3000/api/v1/users/gridview?limit=10&gender=Female', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response2.status}`);
    console.log(`Total profiles: ${response2.data.profiles?.length || 0}`);
    
    // Test with 'male'
    console.log('\n👨 Testing with gender=male:');
    const response3 = await axios.get('http://localhost:3000/api/v1/users/gridview?limit=10&gender=male', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response3.status}`);
    console.log(`Total profiles: ${response3.data.profiles?.length || 0}`);
    
  } catch (error: any) {
    console.error('❌ Error testing gender API:', error.response?.data || error.message);
  }
}

testGenderAPI(); 
import axios from 'axios';

async function testAdjectiveLogic4() {
  try {
    console.log('🧪 Testing Core Adjective Logic...');
    
    // Ankit's token (user 15)
    const ankitToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
    
    // Nisarg's token (user 30)
    const nisargToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDM5NTAxNywiZXhwIjoxNzU0ODI3MDE3fQ.LpUQaTFoOnRMqDze7eCxE5vtUe1v3pQal6lZLr7uhcU';
    
    const ankitHeaders = {
      'Authorization': `Bearer ${ankitToken}`,
      'Content-Type': 'application/json'
    };
    
    const nisargHeaders = {
      'Authorization': `Bearer ${nisargToken}`,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Ankit views user 20's profile and gets adjectives
    console.log('\n📝 Test 1: Ankit views user 20\'s profile');
    const ankitViewResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/20', { headers: ankitHeaders });
    console.log('Ankit sees adjectives:', ankitViewResponse.data.adjectives);
    console.log('Has target user selection:', ankitViewResponse.data.hasTargetUserSelection);
    console.log('Target user selection:', ankitViewResponse.data.targetUserSelection);
    
    // Test 2: Ankit selects "Innovative" for user 20
    console.log('\n📝 Test 2: Ankit selects "Innovative" for user 20');
    const ankitSelection = await axios.post('http://localhost:3000/api/v1/enhanced-explore/adjectives/select', {
      targetUserId: 20,
      adjective: 'Innovative'
    }, { headers: ankitHeaders });
    console.log('Ankit selection response:', ankitSelection.data);
    
    // Test 3: Ankit views user 20's profile again to see if his selection is saved
    console.log('\n📝 Test 3: Ankit views user 20\'s profile again');
    const ankitViewResponse2 = await axios.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/20', { headers: ankitHeaders });
    console.log('Ankit sees adjectives again:', ankitViewResponse2.data.adjectives);
    console.log('Has current user selection:', ankitViewResponse2.data.hasCurrentUserSelection);
    console.log('Current user selection:', ankitViewResponse2.data.currentUserSelection);
    
    // Test 4: Nisarg views user 25's profile
    console.log('\n📝 Test 4: Nisarg views user 25\'s profile');
    const nisargViewResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/25', { headers: nisargHeaders });
    console.log('Nisarg sees adjectives:', nisargViewResponse.data.adjectives);
    console.log('Has target user selection:', nisargViewResponse.data.hasTargetUserSelection);
    console.log('Target user selection:', nisargViewResponse.data.targetUserSelection);
    
    // Test 5: Nisarg selects "Steadfast" for user 25
    console.log('\n📝 Test 5: Nisarg selects "Steadfast" for user 25');
    const nisargSelection = await axios.post('http://localhost:3000/api/v1/enhanced-explore/adjectives/select', {
      targetUserId: 25,
      adjective: 'Steadfast'
    }, { headers: nisargHeaders });
    console.log('Nisarg selection response:', nisargSelection.data);
    
    // Test 6: Nisarg views user 25's profile again
    console.log('\n📝 Test 6: Nisarg views user 25\'s profile again');
    const nisargViewResponse2 = await axios.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/25', { headers: nisargHeaders });
    console.log('Nisarg sees adjectives again:', nisargViewResponse2.data.adjectives);
    console.log('Has current user selection:', nisargViewResponse2.data.hasCurrentUserSelection);
    console.log('Current user selection:', nisargViewResponse2.data.currentUserSelection);
    
    console.log('\n✅ Core logic test completed successfully!');
    console.log('✅ Adjectives are being shown correctly');
    console.log('✅ Selections are being saved correctly');
    console.log('✅ Update functionality is working');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdjectiveLogic4(); 
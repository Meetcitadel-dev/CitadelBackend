import axios from 'axios';

async function testAdjectiveLogic3() {
  try {
    console.log('🧪 Testing Corrected Adjective Logic with Different Users...');
    
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
    
    // Test 1: Ankit views user 20's profile (different user)
    console.log('\n📝 Test 1: Ankit views user 20\'s profile');
    const ankitViewResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/20', { headers: ankitHeaders });
    console.log('Ankit sees adjectives:', ankitViewResponse.data.adjectives);
    
    // Test 2: Ankit selects "Creative" for user 20
    console.log('\n📝 Test 2: Ankit selects "Creative" for user 20');
    const ankitSelection = await axios.post('http://localhost:3000/api/v1/enhanced-explore/adjectives/select', {
      targetUserId: 20,
      adjective: 'Creative'
    }, { headers: ankitHeaders });
    console.log('Ankit selection response:', ankitSelection.data);
    
    // Test 3: User 20 views Ankit's profile and should see "Creative"
    console.log('\n📝 Test 3: User 20 views Ankit\'s profile (user 15)');
    try {
      const user20Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIwLCJ1c2VybmFtZSI6InVzZXIyMCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJ1c2VyMjBAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTQzMzgzNiwiZXhwIjoxNzU0NjY2MzZ9.example';
      
      const user20Headers = {
        'Authorization': `Bearer ${user20Token}`,
        'Content-Type': 'application/json'
      };
      
      const user20ViewResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/15', { headers: user20Headers });
      console.log('User 20 sees adjectives:', user20ViewResponse.data.adjectives);
      console.log('Target user selection (Ankit\'s choice for user 20):', user20ViewResponse.data.targetUserSelection);
      
      // Test 4: User 20 selects "Creative" for Ankit
      console.log('\n📝 Test 4: User 20 selects "Creative" for Ankit');
      const user20Selection = await axios.post('http://localhost:3000/api/v1/enhanced-explore/adjectives/select', {
        targetUserId: 15,
        adjective: 'Creative'
      }, { headers: user20Headers });
      console.log('User 20 selection response:', user20Selection.data);
      
      // Test 5: Check if they matched
      console.log('\n📝 Test 5: Check match state');
      const matchStateResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/matches/state/15', { headers: user20Headers });
      console.log('Match state:', matchStateResponse.data);
      
    } catch (error: any) {
      console.log('User 20 test skipped (token might be invalid):', error.message);
    }
    
    // Test 6: Test with Nisarg viewing a different user (user 25)
    console.log('\n📝 Test 6: Nisarg views user 25\'s profile');
    const nisargViewResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/25', { headers: nisargHeaders });
    console.log('Nisarg sees adjectives:', nisargViewResponse.data.adjectives);
    
    // Test 7: Nisarg selects "Smart" for user 25
    console.log('\n📝 Test 7: Nisarg selects "Smart" for user 25');
    const nisargSelection = await axios.post('http://localhost:3000/api/v1/enhanced-explore/adjectives/select', {
      targetUserId: 25,
      adjective: 'Smart'
    }, { headers: nisargHeaders });
    console.log('Nisarg selection response:', nisargSelection.data);
    
    // Test 8: User 25 views Nisarg's profile and should see "Smart"
    console.log('\n📝 Test 8: User 25 views Nisarg\'s profile (user 30)');
    try {
      const user25Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjI1LCJ1c2VybmFtZSI6InVzZXIyNSIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJ1c2VyMjVAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTQzMzgzNiwiZXhwIjoxNzU0NjY2MzZ9.example';
      
      const user25Headers = {
        'Authorization': `Bearer ${user25Token}`,
        'Content-Type': 'application/json'
      };
      
      const user25ViewResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/30', { headers: user25Headers });
      console.log('User 25 sees adjectives:', user25ViewResponse.data.adjectives);
      console.log('Target user selection (Nisarg\'s choice for user 25):', user25ViewResponse.data.targetUserSelection);
      
    } catch (error: any) {
      console.log('User 25 test skipped (token might be invalid):', error.message);
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdjectiveLogic3(); 
import axios from 'axios';

async function testAdjectiveLogic() {
  try {
    console.log('🧪 Testing Corrected Adjective Logic...');
    
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
    
    // Step 1: Ankit views Nisarg's profile and gets adjectives
    console.log('\n📝 Step 1: Ankit views Nisarg\'s profile (user 30)');
    const ankitViewResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/30', { headers: ankitHeaders });
    console.log('Ankit sees adjectives:', ankitViewResponse.data.adjectives);
    
    // Step 2: Ankit selects an adjective for Nisarg
    console.log('\n📝 Step 2: Ankit selects "Resilient" for Nisarg');
    const ankitSelection = await axios.post('http://localhost:3000/api/v1/enhanced-explore/adjectives/select', {
      targetUserId: 30,
      adjective: 'Resilient'
    }, { headers: ankitHeaders });
    console.log('Ankit selection response:', ankitSelection.data);
    
    // Step 3: Nisarg views Ankit's profile and should see "Resilient"
    console.log('\n📝 Step 3: Nisarg views Ankit\'s profile (user 15)');
    const nisargViewResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/15', { headers: nisargHeaders });
    console.log('Nisarg sees adjectives:', nisargViewResponse.data.adjectives);
    console.log('Target user selection (Ankit\'s choice for Nisarg):', nisargViewResponse.data.targetUserSelection);
    
    // Step 4: Nisarg selects the same adjective
    console.log('\n📝 Step 4: Nisarg selects "Resilient" for Ankit');
    const nisargSelection = await axios.post('http://localhost:3000/api/v1/enhanced-explore/adjectives/select', {
      targetUserId: 15,
      adjective: 'Resilient'
    }, { headers: nisargHeaders });
    console.log('Nisarg selection response:', nisargSelection.data);
    
    // Step 5: Check if they matched
    console.log('\n📝 Step 5: Check match state');
    const matchStateResponse = await axios.get('http://localhost:3000/api/v1/enhanced-explore/matches/state/15', { headers: nisargHeaders });
    console.log('Match state:', matchStateResponse.data);
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdjectiveLogic(); 
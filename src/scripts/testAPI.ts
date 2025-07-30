import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzODc0MzA3LCJleHAiOjE3NTQzMDYzMDd9.YjQoDPFDGPT6rfOHnr55yV2zTtsXvKGaC1-ilOsz6vY';

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test Active Conversations
    console.log('🔗 Testing Active Conversations...');
    const activeResponse = await axios.get(`${BASE_URL}/api/v1/chats/active`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('Status:', activeResponse.status);
    console.log('Response:', JSON.stringify(activeResponse.data, null, 2));

    console.log('\n💕 Testing Matched Conversations...');
    const matchesResponse = await axios.get(`${BASE_URL}/api/v1/chats/matches`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('Status:', matchesResponse.status);
    console.log('Response:', JSON.stringify(matchesResponse.data, null, 2));

  } catch (error: any) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testAPI(); 
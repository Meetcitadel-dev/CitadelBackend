import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzNzI3NjI1LCJleHAiOjE3NTQxNTk2MjV9.sT6crFmHnsM8za-NJIaP5ph2mVuVkVY-RMuJL99SzJo';

async function testChatAPI() {
  try {
    console.log('🧪 Testing Chat API...\n');

    // Test Active Conversations
    console.log('🔗 Testing Active Conversations...');
    const activeResponse = await axios.get(`${BASE_URL}/api/v1/chats/active`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('Status:', activeResponse.status);
    console.log('Active Conversations:', activeResponse.data.conversations.length);
    activeResponse.data.conversations.forEach((conv: any, index: number) => {
      console.log(`${index + 1}. ${conv.name} (ID: ${conv.userId}) - ${conv.lastMessage || 'No messages'} - Online: ${conv.isOnline}`);
    });

    console.log('\n💕 Testing Matched Conversations...');
    const matchesResponse = await axios.get(`${BASE_URL}/api/v1/chats/matches`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('Status:', matchesResponse.status);
    console.log('Matched Conversations:', matchesResponse.data.conversations.length);
    matchesResponse.data.conversations.forEach((conv: any, index: number) => {
      console.log(`${index + 1}. ${conv.name} (ID: ${conv.userId}) - ${conv.lastMessage || 'No messages'} - Online: ${conv.isOnline}`);
    });

    console.log('\n✅ Chat API test complete!');

  } catch (error: any) {
    console.error('❌ Error testing chat API:', error.response?.data || error.message);
  }
}

testChatAPI(); 
import dotenv from 'dotenv';
dotenv.config();

async function testTrackView() {
  try {
    console.log('🧪 TESTING TRACK-VIEW ENDPOINT\n');

    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzNzI3NjI1LCJleHAiOjE3NTQxNTk2MjV9.sT6crFmHnsM8za-NJIaP5ph2mVuVkVY-RMuJL99SzJo';

    const response = await fetch('http://localhost:3000/api/v1/explore/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ targetUserId: 24 })
    });

    console.log('📊 RESPONSE STATUS:', response.status);
    console.log('📊 RESPONSE HEADERS:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log('📊 RESPONSE BODY:', data);

    if (response.ok) {
      console.log('✅ Track-view endpoint is working!');
    } else {
      console.log('❌ Track-view endpoint failed');
    }

  } catch (error) {
    console.error('❌ Error testing track-view:', error);
  } finally {
    process.exit(0);
  }
}

testTrackView();
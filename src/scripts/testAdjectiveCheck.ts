import dotenv from 'dotenv';
dotenv.config();

async function testAdjectiveCheck() {
  try {
    console.log('🧪 TESTING ADJECTIVE SELECTION CHECK\n');

    const baseUrl = 'http://localhost:3000/api/v1/explore';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzNzI3NjI1LCJleHAiOjE3NTQxNTk2MjV9.sT6crFmHnsM8za-NJIaP5ph2mVuVkVY-RMuJL99SzJo';

    // Test 1: Check if user has selected adjective for Isha Kapoor (ID: 24)
    console.log('1️⃣ Checking adjective selection for Isha Kapoor (ID: 24)...');
    const checkResponse1 = await fetch(`${baseUrl}/adjectives/check/24`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const checkResult1 = await checkResponse1.json();
    console.log('   Response:', checkResult1);

    // Test 2: Try to select an adjective for Isha Kapoor
    console.log('\n2️⃣ Trying to select adjective for Isha Kapoor...');
    const selectResponse = await fetch(`${baseUrl}/adjectives/select`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetUserId: 24,
        adjective: 'Smart'
      })
    });

    const selectResult = await selectResponse.json();
    console.log('   Response:', selectResult);

    // Test 3: Check again after attempting selection
    console.log('\n3️⃣ Checking adjective selection again...');
    const checkResponse2 = await fetch(`${baseUrl}/adjectives/check/24`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const checkResult2 = await checkResponse2.json();
    console.log('   Response:', checkResult2);

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('❌ Error testing adjective check:', error);
  }
}

testAdjectiveCheck();
import dotenv from 'dotenv';
dotenv.config();

import redisClient, { isRedisAvailable, safeRedisCommand } from '../config/redis';

async function testUpstashRedis() {
  console.log('🧪 Testing Upstash Redis Configuration...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing Redis connection...');
    const isAvailable = isRedisAvailable();
    console.log(`   Redis available: ${isAvailable}`);

    // Test 2: Ping
    console.log('\n2️⃣ Testing ping...');
    const pingResult = await safeRedisCommand(
      () => redisClient.ping(),
      'FAILED'
    );
    console.log(`   Ping result: ${pingResult}`);

    // Test 3: Set and Get
    console.log('\n3️⃣ Testing set/get operations...');
    const testKey = 'test:upstash:' + Date.now();
    const testValue = 'Hello Upstash Redis!';

    const setResult = await safeRedisCommand(
      () => redisClient.set(testKey, testValue),
      null
    );
    console.log(`   Set result: ${setResult}`);

    const getValue = await safeRedisCommand(
      () => redisClient.get(testKey),
      null
    );
    console.log(`   Get result: ${getValue}`);
    console.log(`   Values match: ${getValue === testValue}`);

    // Test 4: SetEx (with expiration)
    console.log('\n4️⃣ Testing setEx operation...');
    const expiryKey = 'test:expiry:' + Date.now();
    const expiryValue = 'This will expire in 10 seconds';

    const setExResult = await safeRedisCommand(
      () => redisClient.setEx(expiryKey, 10, expiryValue),
      null
    );
    console.log(`   SetEx result: ${setExResult}`);

    const getExpiryValue = await safeRedisCommand(
      () => redisClient.get(expiryKey),
      null
    );
    console.log(`   Get expiry value: ${getExpiryValue}`);

    // Test 5: Keys pattern matching
    console.log('\n5️⃣ Testing keys pattern matching...');
    const keysResult = await safeRedisCommand(
      () => redisClient.keys('test:*'),
      []
    );
    console.log(`   Keys matching 'test:*': ${keysResult?.length || 0} keys`);
    console.log(`   Keys: ${JSON.stringify(keysResult)}`);

    // Test 6: Delete
    console.log('\n6️⃣ Testing delete operation...');
    const delResult = await safeRedisCommand(
      () => redisClient.del(testKey),
      0
    );
    console.log(`   Delete result: ${delResult}`);

    const getAfterDelete = await safeRedisCommand(
      () => redisClient.get(testKey),
      'NOT_FOUND'
    );
    console.log(`   Get after delete: ${getAfterDelete}`);

    // Test 7: University cache simulation
    console.log('\n7️⃣ Testing university cache simulation...');
    const universityCacheKey = 'universities::20:0';
    const mockUniversities = [
      { id: 1, name: 'Test University', domain: 'test.edu', country: 'Test Country' }
    ];

    const cacheSetResult = await safeRedisCommand(
      () => redisClient.setEx(universityCacheKey, 300, JSON.stringify(mockUniversities)),
      null
    );
    console.log(`   Cache set result: ${cacheSetResult}`);

    const cachedData = await safeRedisCommand(
      () => redisClient.get(universityCacheKey),
      null
    );
    console.log(`   Cached data retrieved: ${cachedData ? 'YES' : 'NO'}`);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        console.log(`   Parsed universities: ${parsedData.length} items`);
        console.log(`   First university: ${JSON.stringify(parsedData[0])}`);
      } catch (parseError) {
        console.log(`   Raw cached data: ${cachedData}`);
        console.log(`   JSON parse error: ${parseError}`);
      }
    }

    // Cleanup
    await safeRedisCommand(
      () => redisClient.del([expiryKey, universityCacheKey]),
      0
    );

    console.log('\n✅ All Redis tests completed successfully!');
    console.log(`🔧 Using Redis client: ${(redisClient as any).isUpstash ? 'Upstash' : 'Traditional'}`);

  } catch (error) {
    console.error('\n❌ Redis test failed:', error);
  }
}

// Run the test
testUpstashRedis().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test script error:', error);
  process.exit(1);
});

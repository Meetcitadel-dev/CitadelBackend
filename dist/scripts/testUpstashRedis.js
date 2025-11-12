"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redis_1 = __importStar(require("../config/redis"));
async function testUpstashRedis() {
    console.log('🧪 Testing Upstash Redis Configuration...\n');
    try {
        // Test 1: Basic connection
        console.log('1️⃣ Testing Redis connection...');
        const isAvailable = (0, redis_1.isRedisAvailable)();
        console.log(`   Redis available: ${isAvailable}`);
        // Test 2: Ping
        console.log('\n2️⃣ Testing ping...');
        const pingResult = await (0, redis_1.safeRedisCommand)(() => redis_1.default.ping(), 'FAILED');
        console.log(`   Ping result: ${pingResult}`);
        // Test 3: Set and Get
        console.log('\n3️⃣ Testing set/get operations...');
        const testKey = 'test:upstash:' + Date.now();
        const testValue = 'Hello Upstash Redis!';
        const setResult = await (0, redis_1.safeRedisCommand)(() => redis_1.default.set(testKey, testValue), null);
        console.log(`   Set result: ${setResult}`);
        const getValue = await (0, redis_1.safeRedisCommand)(() => redis_1.default.get(testKey), null);
        console.log(`   Get result: ${getValue}`);
        console.log(`   Values match: ${getValue === testValue}`);
        // Test 4: SetEx (with expiration)
        console.log('\n4️⃣ Testing setEx operation...');
        const expiryKey = 'test:expiry:' + Date.now();
        const expiryValue = 'This will expire in 10 seconds';
        const setExResult = await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(expiryKey, 10, expiryValue), null);
        console.log(`   SetEx result: ${setExResult}`);
        const getExpiryValue = await (0, redis_1.safeRedisCommand)(() => redis_1.default.get(expiryKey), null);
        console.log(`   Get expiry value: ${getExpiryValue}`);
        // Test 5: Keys pattern matching
        console.log('\n5️⃣ Testing keys pattern matching...');
        const keysResult = await (0, redis_1.safeRedisCommand)(() => redis_1.default.keys('test:*'), []);
        console.log(`   Keys matching 'test:*': ${(keysResult === null || keysResult === void 0 ? void 0 : keysResult.length) || 0} keys`);
        console.log(`   Keys: ${JSON.stringify(keysResult)}`);
        // Test 6: Delete
        console.log('\n6️⃣ Testing delete operation...');
        const delResult = await (0, redis_1.safeRedisCommand)(() => redis_1.default.del(testKey), 0);
        console.log(`   Delete result: ${delResult}`);
        const getAfterDelete = await (0, redis_1.safeRedisCommand)(() => redis_1.default.get(testKey), 'NOT_FOUND');
        console.log(`   Get after delete: ${getAfterDelete}`);
        // Test 7: University cache simulation
        console.log('\n7️⃣ Testing university cache simulation...');
        const universityCacheKey = 'universities::20:0';
        const mockUniversities = [
            { id: 1, name: 'Test University', domain: 'test.edu', country: 'Test Country' }
        ];
        const cacheSetResult = await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(universityCacheKey, 300, JSON.stringify(mockUniversities)), null);
        console.log(`   Cache set result: ${cacheSetResult}`);
        const cachedData = await (0, redis_1.safeRedisCommand)(() => redis_1.default.get(universityCacheKey), null);
        console.log(`   Cached data retrieved: ${cachedData ? 'YES' : 'NO'}`);
        if (cachedData) {
            try {
                const parsedData = JSON.parse(cachedData);
                console.log(`   Parsed universities: ${parsedData.length} items`);
                console.log(`   First university: ${JSON.stringify(parsedData[0])}`);
            }
            catch (parseError) {
                console.log(`   Raw cached data: ${cachedData}`);
                console.log(`   JSON parse error: ${parseError}`);
            }
        }
        // Cleanup
        await (0, redis_1.safeRedisCommand)(() => redis_1.default.del([expiryKey, universityCacheKey]), 0);
        console.log('\n✅ All Redis tests completed successfully!');
        console.log(`🔧 Using Redis client: ${redis_1.default.isUpstash ? 'Upstash' : 'Traditional'}`);
    }
    catch (error) {
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

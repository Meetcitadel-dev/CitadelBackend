"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const axios_1 = __importDefault(require("axios"));
const BASE_URL = process.env.API_URL || 'http://localhost:3001';
async function testUniversityAPI() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    console.log('🧪 Testing University API with Upstash Redis...\n');
    try {
        // Test 1: Get universities without search (should hit cache after first call)
        console.log('1️⃣ Testing university API without search...');
        const start1 = Date.now();
        const response1 = await axios_1.default.get(`${BASE_URL}/api/v1/universities?limit=5`);
        const time1 = Date.now() - start1;
        console.log(`   Status: ${response1.status}`);
        console.log(`   Response time: ${time1}ms`);
        console.log(`   Universities returned: ${((_a = response1.data.universities) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
        console.log(`   Success: ${response1.data.success}`);
        // Test 2: Same request again (should be faster due to cache)
        console.log('\n2️⃣ Testing same request again (should hit cache)...');
        const start2 = Date.now();
        const response2 = await axios_1.default.get(`${BASE_URL}/api/v1/universities?limit=5`);
        const time2 = Date.now() - start2;
        console.log(`   Status: ${response2.status}`);
        console.log(`   Response time: ${time2}ms (${time2 < time1 ? 'FASTER' : 'SLOWER'} than first call)`);
        console.log(`   Universities returned: ${((_b = response2.data.universities) === null || _b === void 0 ? void 0 : _b.length) || 0}`);
        console.log(`   Cache hit likely: ${time2 < time1 ? 'YES' : 'NO'}`);
        // Test 3: Search for universities
        console.log('\n3️⃣ Testing university search...');
        const start3 = Date.now();
        const response3 = await axios_1.default.get(`${BASE_URL}/api/v1/universities?search=university&limit=10`);
        const time3 = Date.now() - start3;
        console.log(`   Status: ${response3.status}`);
        console.log(`   Response time: ${time3}ms`);
        console.log(`   Universities returned: ${((_c = response3.data.universities) === null || _c === void 0 ? void 0 : _c.length) || 0}`);
        if (((_d = response3.data.universities) === null || _d === void 0 ? void 0 : _d.length) > 0) {
            console.log(`   First result: ${response3.data.universities[0].name}`);
        }
        // Test 4: Same search again (should hit cache)
        console.log('\n4️⃣ Testing same search again (should hit cache)...');
        const start4 = Date.now();
        const response4 = await axios_1.default.get(`${BASE_URL}/api/v1/universities?search=university&limit=10`);
        const time4 = Date.now() - start4;
        console.log(`   Status: ${response4.status}`);
        console.log(`   Response time: ${time4}ms (${time4 < time3 ? 'FASTER' : 'SLOWER'} than first search)`);
        console.log(`   Universities returned: ${((_e = response4.data.universities) === null || _e === void 0 ? void 0 : _e.length) || 0}`);
        console.log(`   Cache hit likely: ${time4 < time3 ? 'YES' : 'NO'}`);
        // Test 5: Different search term
        console.log('\n5️⃣ Testing different search term...');
        const start5 = Date.now();
        const response5 = await axios_1.default.get(`${BASE_URL}/api/v1/universities?search=college&limit=10`);
        const time5 = Date.now() - start5;
        console.log(`   Status: ${response5.status}`);
        console.log(`   Response time: ${time5}ms`);
        console.log(`   Universities returned: ${((_f = response5.data.universities) === null || _f === void 0 ? void 0 : _f.length) || 0}`);
        // Test 6: Short search term (should return empty or error)
        console.log('\n6️⃣ Testing short search term...');
        const start6 = Date.now();
        const response6 = await axios_1.default.get(`${BASE_URL}/api/v1/universities?search=a&limit=10`);
        const time6 = Date.now() - start6;
        console.log(`   Status: ${response6.status}`);
        console.log(`   Response time: ${time6}ms`);
        console.log(`   Universities returned: ${((_g = response6.data.universities) === null || _g === void 0 ? void 0 : _g.length) || 0}`);
        console.log('\n✅ All University API tests completed successfully!');
        console.log('\n📊 Performance Summary:');
        console.log(`   First call: ${time1}ms`);
        console.log(`   Cached call: ${time2}ms (${Math.round(((time1 - time2) / time1) * 100)}% faster)`);
        console.log(`   First search: ${time3}ms`);
        console.log(`   Cached search: ${time4}ms (${Math.round(((time3 - time4) / time3) * 100)}% faster)`);
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error('\n❌ API test failed:');
            console.error(`   Status: ${(_h = error.response) === null || _h === void 0 ? void 0 : _h.status}`);
            console.error(`   Message: ${((_k = (_j = error.response) === null || _j === void 0 ? void 0 : _j.data) === null || _k === void 0 ? void 0 : _k.message) || error.message}`);
            console.error(`   URL: ${(_l = error.config) === null || _l === void 0 ? void 0 : _l.url}`);
        }
        else {
            console.error('\n❌ Unexpected error:', error);
        }
    }
}
// Run the test
testUniversityAPI().then(() => {
    console.log('\n🏁 University API test completed');
    process.exit(0);
}).catch((error) => {
    console.error('Test script error:', error);
    process.exit(1);
});

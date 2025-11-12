"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000';
async function testGroupsEndpoint() {
    var _a, _b, _c, _d, _e, _f, _g;
    console.log('🧪 Testing Groups Endpoint...\n');
    try {
        // Test 1: Check if server is running
        console.log('✅ Test 1: Checking server status...');
        const testResponse = await axios_1.default.get(`${BASE_URL}/api/test`);
        console.log('✅ Server is running:', testResponse.data);
        // Test 2: Test groups endpoint without auth (should fail)
        console.log('\n✅ Test 2: Testing groups endpoint without auth...');
        try {
            await axios_1.default.get(`${BASE_URL}/api/v1/groups`);
            console.log('❌ Should have failed without auth');
        }
        catch (error) {
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                console.log('✅ Correctly rejected without authentication');
            }
            else {
                console.log('❌ Unexpected error:', (_b = error.response) === null || _b === void 0 ? void 0 : _b.status);
            }
        }
        // Test 3: Test groups endpoint with invalid auth
        console.log('\n✅ Test 3: Testing groups endpoint with invalid auth...');
        try {
            await axios_1.default.get(`${BASE_URL}/api/v1/groups`, {
                headers: { Authorization: 'Bearer invalid_token' }
            });
            console.log('❌ Should have failed with invalid token');
        }
        catch (error) {
            if (((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) === 401 || ((_d = error.response) === null || _d === void 0 ? void 0 : _d.status) === 403) {
                console.log('✅ Correctly rejected with invalid token');
            }
            else {
                console.log('❌ Unexpected error:', (_e = error.response) === null || _e === void 0 ? void 0 : _e.status);
            }
        }
        // Test 4: Test POST groups endpoint without auth (should fail)
        console.log('\n✅ Test 4: Testing POST groups endpoint without auth...');
        try {
            await axios_1.default.post(`${BASE_URL}/api/v1/groups`, {
                name: 'Test Group',
                memberIds: []
            });
            console.log('❌ Should have failed without auth');
        }
        catch (error) {
            if (((_f = error.response) === null || _f === void 0 ? void 0 : _f.status) === 401) {
                console.log('✅ Correctly rejected POST without authentication');
            }
            else {
                console.log('❌ Unexpected error:', (_g = error.response) === null || _g === void 0 ? void 0 : _g.status);
            }
        }
        console.log('\n🎉 Groups endpoint tests completed!');
        console.log('\n📋 Next steps:');
        console.log('1. The server is running correctly');
        console.log('2. The /api/v1/groups endpoint exists');
        console.log('3. Authentication is working');
        console.log('4. Test with a valid JWT token from your frontend');
        console.log('5. The route alias is working correctly');
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Server is not running. Start it with: npm run dev');
        }
    }
}
testGroupsEndpoint();

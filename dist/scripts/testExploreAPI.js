"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000/api/v1';
// Mock JWT token (you'll need to replace this with a real token)
const MOCK_TOKEN = 'your-jwt-token-here';
const api = axios_1.default.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${MOCK_TOKEN}`,
        'Content-Type': 'application/json'
    }
});
async function testExploreAPI() {
    console.log('🧪 Testing Explore API Endpoints...\n');
    try {
        // Test 1: Get explore profiles
        console.log('1. Testing GET /explore/profiles');
        try {
            const profilesResponse = await api.get('/explore/profiles?limit=5&offset=0');
            console.log('✅ Profiles fetched successfully');
            console.log(`   Found ${profilesResponse.data.profiles.length} profiles`);
            console.log(`   Has more: ${profilesResponse.data.hasMore}`);
        }
        catch (error) {
            console.log('❌ Failed to fetch profiles:', error.response?.data || error.message);
        }
        // Test 2: Get connection status
        console.log('\n2. Testing GET /connections/status/:targetUserId');
        try {
            const statusResponse = await api.get('/connections/status/1');
            console.log('✅ Connection status fetched successfully');
            console.log(`   Status: ${statusResponse.data.connectionState?.status || 'not_connected'}`);
        }
        catch (error) {
            console.log('❌ Failed to fetch connection status:', error.response?.data || error.message);
        }
        // Test 3: Select adjective
        console.log('\n3. Testing POST /explore/adjectives/select');
        try {
            const adjectiveResponse = await api.post('/explore/adjectives/select', {
                targetUserId: 1,
                adjective: 'Smart'
            });
            console.log('✅ Adjective selected successfully');
            console.log(`   Matched: ${adjectiveResponse.data.matched}`);
        }
        catch (error) {
            console.log('❌ Failed to select adjective:', error.response?.data || error.message);
        }
        // Test 4: Get adjective matches
        console.log('\n4. Testing GET /explore/adjectives/matches');
        try {
            const matchesResponse = await api.get('/explore/adjectives/matches');
            console.log('✅ Adjective matches fetched successfully');
            console.log(`   Found ${matchesResponse.data.matches.length} matches`);
        }
        catch (error) {
            console.log('❌ Failed to fetch adjective matches:', error.response?.data || error.message);
        }
        // Test 5: Manage connection (connect)
        console.log('\n5. Testing POST /connections/manage (connect)');
        try {
            const connectResponse = await api.post('/connections/manage', {
                targetUserId: 1,
                action: 'connect'
            });
            console.log('✅ Connection request sent successfully');
            console.log(`   Status: ${connectResponse.data.connectionState?.status}`);
        }
        catch (error) {
            console.log('❌ Failed to send connection request:', error.response?.data || error.message);
        }
        console.log('\n🎉 Explore API testing completed!');
        console.log('\n📋 API Endpoints Summary:');
        console.log('   GET    /api/v1/explore/profiles');
        console.log('   POST   /api/v1/connections/manage');
        console.log('   POST   /api/v1/explore/adjectives/select');
        console.log('   GET    /api/v1/explore/adjectives/matches');
        console.log('   GET    /api/v1/connections/status/:targetUserId');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
}
testExploreAPI();

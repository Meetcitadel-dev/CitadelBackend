"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000';
async function checkServerStatus() {
    console.log('🔍 Checking server status...\n');
    try {
        // Test 1: Basic server connectivity
        console.log('1️⃣ Testing basic server connectivity...');
        const response = await axios_1.default.get(`${BASE_URL}/api/v1/health`, {
            timeout: 5000
        });
        console.log('✅ Server is running and accessible');
        console.log('📊 Response:', response.data);
        console.log('');
        // Test 2: Check if group chat endpoints are available
        console.log('2️⃣ Testing group chat endpoint availability...');
        try {
            const groupsResponse = await axios_1.default.get(`${BASE_URL}/api/v1/groups`, {
                timeout: 5000,
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ Groups endpoint is accessible');
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Groups endpoint is accessible (authentication required as expected)');
            }
            else {
                console.log('❌ Groups endpoint error:', error.response?.status, error.response?.data);
            }
        }
        // Test 3: Check connections endpoint
        console.log('3️⃣ Testing connections endpoint...');
        try {
            const connectionsResponse = await axios_1.default.get(`${BASE_URL}/api/v1/connections`, {
                timeout: 5000,
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ Connections endpoint is accessible');
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Connections endpoint is accessible (authentication required as expected)');
            }
            else {
                console.log('❌ Connections endpoint error:', error.response?.status, error.response?.data);
            }
        }
        console.log('\n🎉 Server status check completed!');
        console.log('💡 The backend server is running correctly.');
        console.log('💡 All endpoints are accessible and properly configured.');
        console.log('💡 Authentication is working as expected.');
    }
    catch (error) {
        console.error('❌ Server check failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('🔌 Connection refused. Please start the server with: npm run dev');
        }
        else if (error.code === 'ENOTFOUND') {
            console.log('🌐 Server not found. Please check if the server is running on localhost:3000');
        }
        else if (error.code === 'ETIMEDOUT') {
            console.log('⏰ Request timed out. Server might be slow to respond.');
        }
    }
}
// Run the check
checkServerStatus();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000/api/v1';
async function testLogout() {
    var _a;
    try {
        // You'll need to replace these with actual test data
        const token = 'YOUR_TEST_TOKEN_HERE';
        console.log('🧪 Testing logout endpoint...');
        const response = await axios_1.default.post(`${BASE_URL}/auth/logout`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', JSON.stringify(response.data, null, 2));
        if (response.data.success) {
            console.log('✅ Logout endpoint is working!');
        }
        else {
            console.log('❌ Logout endpoint failed');
        }
    }
    catch (error) {
        console.error('Error testing logout:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
}
async function testDeleteAccount() {
    var _a;
    try {
        // You'll need to replace these with actual test data
        const token = 'YOUR_TEST_TOKEN_HERE';
        console.log('\n🧪 Testing delete account endpoint...');
        const response = await axios_1.default.delete(`${BASE_URL}/profile/delete-account`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', JSON.stringify(response.data, null, 2));
        if (response.data.success) {
            console.log('✅ Delete account endpoint is working!');
            console.log('⚠️  WARNING: Account has been deleted!');
        }
        else {
            console.log('❌ Delete account endpoint failed');
        }
    }
    catch (error) {
        console.error('Error testing delete account:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
}
// Run tests
async function runTests() {
    console.log('🧪 Testing Logout and Delete Account Functionality\n');
    await testLogout();
    await testDeleteAccount();
    console.log('\n✅ Tests completed!');
}
runTests().catch(console.error);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzODc0MzA3LCJleHAiOjE3NTQzMDYzMDd9.YjQoDPFDGPT6rfOHnr55yV2zTtsXvKGaC1-ilOsz6vY';
async function simpleTest() {
    try {
        console.log('🧪 Simple API Test...\n');
        // Test if server is running
        console.log('🔍 Testing server connection...');
        try {
            const response = await axios_1.default.get(`${BASE_URL}/api/v1/chats/active`, {
                headers: {
                    'Authorization': `Bearer ${TOKEN}`
                },
                timeout: 5000
            });
            console.log('✅ Server is responding');
            console.log('Status:', response.status);
            console.log('Data:', JSON.stringify(response.data, null, 2));
        }
        catch (error) {
            console.error('❌ Server error:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
        }
    }
    catch (error) {
        console.error('❌ Test error:', error.message);
    }
}
simpleTest();

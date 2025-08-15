"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function quickTest() {
    try {
        console.log('🧪 Quick API Test...');
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzODc0MzA3LCJleHAiOjE3NTQzMDYzMDd9.YjQoDPFDGPT6rfOHnr55yV2zTtsXvKGaC1-ilOsz6vY';
        const response = await axios_1.default.get('http://localhost:3000/api/v1/chats/active', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ API Response:', response.data);
    }
    catch (error) {
        console.error('❌ Error:', error.message);
    }
}
quickTest();

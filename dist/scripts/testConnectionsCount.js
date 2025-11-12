"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const testConnectionsCount = async () => {
    var _a;
    try {
        // You'll need to replace this with a valid JWT token from a logged-in user
        const token = 'YOUR_JWT_TOKEN_HERE';
        const response = await axios_1.default.get('http://localhost:3000/api/v1/connections/count', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', response.data);
        if (response.data.success) {
            console.log(`✅ Connections count: ${response.data.connectionsCount}`);
        }
        else {
            console.log('❌ Failed to get connections count');
        }
    }
    catch (error) {
        console.error('Error testing connections count:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
};
testConnectionsCount();

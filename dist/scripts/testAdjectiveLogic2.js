"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function testAdjectiveLogic2() {
    try {
        console.log('🧪 Testing Corrected Adjective Logic with Different Adjectives...');
        // Ankit's token (user 15)
        const ankitToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0MDMzODM2LCJleHAiOjE3NTQ0NjU4MzZ9.N2Pp5cUZLzzkbV9ag0QqQku90ohP0Dx_Moh4r1SgTPQ';
        // Nisarg's token (user 30)
        const nisargToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmcucGF0ZWxAbWFzdGVyc3VuaW9uLm9yZyIsImlhdCI6MTc1NDM5NTAxNywiZXhwIjoxNzU0ODI3MDE3fQ.LpUQaTFoOnRMqDze7eCxE5vtUe1v3pQal6lZLr7uhcU';
        const ankitHeaders = {
            'Authorization': `Bearer ${ankitToken}`,
            'Content-Type': 'application/json'
        };
        const nisargHeaders = {
            'Authorization': `Bearer ${nisargToken}`,
            'Content-Type': 'application/json'
        };
        // Step 1: Ankit views Nisarg's profile and gets adjectives
        console.log('\n📝 Step 1: Ankit views Nisarg\'s profile (user 30)');
        const ankitViewResponse = await axios_1.default.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/30', { headers: ankitHeaders });
        console.log('Ankit sees adjectives:', ankitViewResponse.data.adjectives);
        // Step 2: Ankit selects "Ambitious" for Nisarg (different adjective)
        console.log('\n📝 Step 2: Ankit selects "Ambitious" for Nisarg');
        const ankitSelection = await axios_1.default.post('http://localhost:3000/api/v1/enhanced-explore/adjectives/select', {
            targetUserId: 30,
            adjective: 'Ambitious'
        }, { headers: ankitHeaders });
        console.log('Ankit selection response:', ankitSelection.data);
        // Step 3: Nisarg views Ankit's profile and should see "Ambitious"
        console.log('\n📝 Step 3: Nisarg views Ankit\'s profile (user 15)');
        const nisargViewResponse = await axios_1.default.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/15', { headers: nisargHeaders });
        console.log('Nisarg sees adjectives:', nisargViewResponse.data.adjectives);
        console.log('Target user selection (Ankit\'s choice for Nisarg):', nisargViewResponse.data.targetUserSelection);
        // Step 4: Nisarg selects "Ambitious" for Ankit
        console.log('\n📝 Step 4: Nisarg selects "Ambitious" for Ankit');
        const nisargSelection = await axios_1.default.post('http://localhost:3000/api/v1/enhanced-explore/adjectives/select', {
            targetUserId: 15,
            adjective: 'Ambitious'
        }, { headers: nisargHeaders });
        console.log('Nisarg selection response:', nisargSelection.data);
        // Step 5: Check if they matched
        console.log('\n📝 Step 5: Check match state');
        const matchStateResponse = await axios_1.default.get('http://localhost:3000/api/v1/enhanced-explore/matches/state/15', { headers: nisargHeaders });
        console.log('Match state:', matchStateResponse.data);
        // Step 6: Test with a third user (if available) - let's test with user 25
        console.log('\n📝 Step 6: Testing with a third user (user 25)');
        try {
            const thirdUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjI1LCJ1c2VybmFtZSI6InRlc3R1c2VyMjUiLCJyb2xlIjoiVVNFUiIsImVtYWlsIjoidGVzdHVzZXIyNUBleGFtcGxlLmNvbSIsImlhdCI6MTc1NDMzODM2LCJleHAiOjE3NTQ2NjYzNn0.example';
            const thirdUserHeaders = {
                'Authorization': `Bearer ${thirdUserToken}`,
                'Content-Type': 'application/json'
            };
            // Third user views Ankit's profile
            console.log('Third user views Ankit\'s profile (user 15)');
            const thirdUserViewResponse = await axios_1.default.get('http://localhost:3000/api/v1/enhanced-explore/adjectives/available/15', { headers: thirdUserHeaders });
            console.log('Third user sees adjectives:', thirdUserViewResponse.data.adjectives);
            console.log('Target user selection (Ankit\'s choice for third user):', thirdUserViewResponse.data.targetUserSelection);
        }
        catch (error) {
            console.log('Third user test skipped (token might be invalid):', error.message);
        }
    }
    catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}
testAdjectiveLogic2();

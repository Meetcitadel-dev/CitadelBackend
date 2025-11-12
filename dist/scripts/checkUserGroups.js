"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;
// Test user tokens
const USER1_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMwLCJ1c2VybmFtZSI6Im5pc2FyZy5wYXRlbCIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJuaXNhcmdwYXRlbEBtYXN0ZXJzdW5pb24ub3JnIiwiaWF0IjoxNzU0ODU3NTEyLCJleHAiOjE3NTU2ODk1MTJ9.Q9Q5FnsLKXHYpl58t7CPFdt-LmD-LLWg7DYKwZJl7wU';
const USER2_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM4LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzU0ODU3MDU4LCJleHAiOjE3NTUyODkwNTh9.LONTTE4Nzuc5z4FlFSTLcC3IneriUs68zFXbws_mvKg';
async function checkUserGroups() {
    var _a, _b, _c, _d, _e, _f;
    console.log('🔍 Checking user groups and token validity...\n');
    const users = [
        { id: 30, name: 'Nisarg Patel', token: USER1_TOKEN },
        { id: 38, name: 'Ankit Kumar Ranjan', token: USER2_TOKEN }
    ];
    for (const user of users) {
        console.log(`👤 Checking user: ${user.name} (ID: ${user.id})`);
        try {
            // Check if token is valid by getting user's groups
            const response = await axios_1.default.get(`${API_BASE}/groups`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) {
                console.log(`✅ Token valid for ${user.name}`);
                console.log(`📋 Groups for ${user.name}:`);
                if (response.data.groups.length === 0) {
                    console.log(`   ❌ No groups found for ${user.name}`);
                }
                else {
                    response.data.groups.forEach((group, index) => {
                        console.log(`   ${index + 1}. Group ID: ${group.id}, Name: "${group.name}", Members: ${group.memberCount}`);
                    });
                }
            }
            else {
                console.log(`❌ Failed to get groups for ${user.name}:`, response.data.message);
            }
        }
        catch (error) {
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                console.log(`❌ Token expired or invalid for ${user.name}`);
            }
            else if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 403) {
                console.log(`❌ Access denied for ${user.name}`);
            }
            else {
                console.log(`❌ Error for ${user.name}:`, ((_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) || error.message);
            }
        }
        console.log('');
    }
    // Check specific group 4
    console.log('🔍 Checking specific group 4...');
    try {
        const response = await axios_1.default.get(`${API_BASE}/groups/4`, {
            headers: {
                'Authorization': `Bearer ${USER2_TOKEN}`, // Using Ankit's token since he has access
                'Content-Type': 'application/json'
            }
        });
        if (response.data.success) {
            const group = response.data.group;
            console.log(`✅ Group 4 details:`);
            console.log(`   Name: "${group.name}"`);
            console.log(`   Members: ${group.memberCount}`);
            console.log(`   Members list:`);
            group.members.forEach((member, index) => {
                console.log(`     ${index + 1}. ${member.name} (ID: ${member.id}) - Admin: ${member.isAdmin}`);
            });
        }
    }
    catch (error) {
        console.log(`❌ Error getting group 4 details:`, ((_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.message) || error.message);
    }
}
// Run the check
checkUserGroups();

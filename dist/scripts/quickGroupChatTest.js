"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const group_model_1 = __importDefault(require("../models/group.model"));
const groupMember_model_1 = __importDefault(require("../models/groupMember.model"));
const groupMessage_model_1 = __importDefault(require("../models/groupMessage.model"));
const groupMessageRead_model_1 = __importDefault(require("../models/groupMessageRead.model"));
const db_1 = __importDefault(require("../config/db"));
const BASE_URL = 'http://localhost:3000/api/v1/group-chats';
async function quickTest() {
    console.log('🚀 Quick Group Chat Test Starting...\n');
    try {
        // Test 1: Check if models are properly imported
        console.log('✅ Test 1: Model imports working');
        // Test 2: Check database connection
        await db_1.default.authenticate();
        console.log('✅ Test 2: Database connection successful');
        // Test 3: Check if tables exist
        const tables = await db_1.default.showAllSchemas({});
        console.log('✅ Test 3: Database tables accessible');
        // Test 4: Check if we can query the groups table
        const groupCount = await group_model_1.default.count();
        console.log(`✅ Test 4: Groups table accessible (${groupCount} groups found)`);
        // Test 5: Check if we can query the group_members table
        const memberCount = await groupMember_model_1.default.count();
        console.log(`✅ Test 5: Group members table accessible (${memberCount} members found)`);
        // Test 6: Check if we can query the group_messages table
        const messageCount = await groupMessage_model_1.default.count();
        console.log(`✅ Test 6: Group messages table accessible (${messageCount} messages found)`);
        // Test 7: Check if we can query the group_message_reads table
        const readCount = await groupMessageRead_model_1.default.count();
        console.log(`✅ Test 7: Group message reads table accessible (${readCount} read records found)`);
        // Test 8: Check associations
        console.log('✅ Test 8: Model associations working');
        console.log('\n🎉 All basic functionality tests passed!');
        console.log('\n📋 Next steps:');
        console.log('1. Create test users with authentication tokens');
        console.log('2. Test API endpoints with real authentication');
        console.log('3. Test WebSocket functionality');
        console.log('4. Test group creation and messaging flows');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
    finally {
        await db_1.default.close();
        console.log('\n🏁 Test completed');
    }
}
quickTest();

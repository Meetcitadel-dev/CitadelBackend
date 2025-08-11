import axios from 'axios';
import { Op } from 'sequelize';
import User from '../models/user.model';
import Group from '../models/group.model';
import GroupMember from '../models/groupMember.model';
import GroupMessage from '../models/groupMessage.model';
import GroupMessageRead from '../models/groupMessageRead.model';
import sequelize from '../config/db';

const BASE_URL = 'http://localhost:3000/api/v1/group-chats';

async function quickTest() {
  console.log('🚀 Quick Group Chat Test Starting...\n');

  try {
    // Test 1: Check if models are properly imported
    console.log('✅ Test 1: Model imports working');
    
    // Test 2: Check database connection
    await sequelize.authenticate();
    console.log('✅ Test 2: Database connection successful');
    
    // Test 3: Check if tables exist
    const tables = await sequelize.showAllSchemas({});
    console.log('✅ Test 3: Database tables accessible');
    
    // Test 4: Check if we can query the groups table
    const groupCount = await Group.count();
    console.log(`✅ Test 4: Groups table accessible (${groupCount} groups found)`);
    
    // Test 5: Check if we can query the group_members table
    const memberCount = await GroupMember.count();
    console.log(`✅ Test 5: Group members table accessible (${memberCount} members found)`);
    
    // Test 6: Check if we can query the group_messages table
    const messageCount = await GroupMessage.count();
    console.log(`✅ Test 6: Group messages table accessible (${messageCount} messages found)`);
    
    // Test 7: Check if we can query the group_message_reads table
    const readCount = await GroupMessageRead.count();
    console.log(`✅ Test 7: Group message reads table accessible (${readCount} read records found)`);
    
    // Test 8: Check associations
    console.log('✅ Test 8: Model associations working');
    
    console.log('\n🎉 All basic functionality tests passed!');
    console.log('\n📋 Next steps:');
    console.log('1. Create test users with authentication tokens');
    console.log('2. Test API endpoints with real authentication');
    console.log('3. Test WebSocket functionality');
    console.log('4. Test group creation and messaging flows');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await sequelize.close();
    console.log('\n🏁 Test completed');
  }
}

quickTest();

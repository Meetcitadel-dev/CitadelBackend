import axios from 'axios';
import { config } from 'dotenv';

config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api/v1`;

// Test user credentials
const testUsers = [
  {
    email: 'testuser1@iitd.ac.in',
    password: 'testpass123'
  },
  {
    email: 'testuser2@iitd.ac.in',
    password: 'testpass123'
  },
  {
    email: 'testuser3@iitd.ac.in',
    password: 'testpass123'
  }
];

let authTokens: string[] = [];
let testGroupId: number | null = null;

// Helper function to make authenticated requests
const makeAuthRequest = async (method: string, url: string, data?: any, tokenIndex: number = 0) => {
  try {
    const response = await axios({
      method,
      url: `${API_BASE}${url}`,
      data,
      headers: {
        'Authorization': `Bearer ${authTokens[tokenIndex]}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error in ${method} ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test authentication
const testAuthentication = async () => {
  console.log('🔐 Testing authentication...');
  
  for (let i = 0; i < testUsers.length; i++) {
    try {
      // Send OTP
      await axios.post(`${API_BASE}/auth/send-otp`, {
        email: testUsers[i].email,
        isLogin: true
      });
      
      // For testing, we'll assume OTP is 123456
      const authResponse = await axios.post(`${API_BASE}/auth/verify-otp`, {
        email: testUsers[i].email,
        otp: '123456'
      });
      
      if (authResponse.data.success) {
        authTokens[i] = authResponse.data.token;
        console.log(`✅ User ${i + 1} authenticated successfully`);
      }
    } catch (error: any) {
      console.log(`⚠️ User ${i + 1} authentication failed:`, error.response?.data?.message || error.message);
    }
  }
};

// Test getting connections
const testGetConnections = async () => {
  console.log('\n🔗 Testing get connections...');
  
  try {
    const response = await makeAuthRequest('GET', '/group-chats/connections');
    console.log('✅ Get connections successful');
    console.log(`📊 Found ${response.connections.length} connections`);
    return response.connections;
  } catch (error) {
    console.log('❌ Get connections failed');
    return [];
  }
};

// Test creating a group
const testCreateGroup = async (connections: any[]) => {
  console.log('\n👥 Testing create group...');
  
  if (connections.length === 0) {
    console.log('⚠️ No connections available for group creation');
    return null;
  }
  
  try {
    const memberIds = connections.slice(0, 2).map(conn => conn.id);
    const groupData = {
      name: 'Test Study Group',
      description: 'A test group for studying together',
      memberIds
    };
    
    const response = await makeAuthRequest('POST', '/group-chats/groups', groupData);
    console.log('✅ Create group successful');
    console.log(`📊 Group created with ID: ${response.group.id}`);
    console.log(`👥 Group has ${response.group.memberCount} members`);
    return response.group.id;
  } catch (error) {
    console.log('❌ Create group failed');
    return null;
  }
};

// Test getting groups
const testGetGroups = async () => {
  console.log('\n📋 Testing get groups...');
  
  try {
    const response = await makeAuthRequest('GET', '/group-chats/groups');
    console.log('✅ Get groups successful');
    console.log(`📊 Found ${response.groups.length} groups`);
    return response.groups;
  } catch (error) {
    console.log('❌ Get groups failed');
    return [];
  }
};

// Test getting specific group
const testGetGroup = async (groupId: number) => {
  console.log(`\n📋 Testing get group ${groupId}...`);
  
  try {
    const response = await makeAuthRequest('GET', `/group-chats/groups/${groupId}`);
    console.log('✅ Get group successful');
    console.log(`📊 Group: ${response.group.name}`);
    console.log(`👥 Members: ${response.group.memberCount}`);
    return response.group;
  } catch (error) {
    console.log('❌ Get group failed');
    return null;
  }
};

// Test sending group message
const testSendGroupMessage = async (groupId: number) => {
  console.log(`\n💬 Testing send group message to group ${groupId}...`);
  
  try {
    const messageData = {
      content: 'Hello everyone! This is a test message from the group chat system.'
    };
    
    const response = await makeAuthRequest('POST', `/group-chats/groups/${groupId}/messages`, messageData);
    console.log('✅ Send group message successful');
    console.log(`📝 Message ID: ${response.message.id}`);
    return response.message;
  } catch (error) {
    console.log('❌ Send group message failed');
    return null;
  }
};

// Test getting group messages
const testGetGroupMessages = async (groupId: number) => {
  console.log(`\n📨 Testing get group messages for group ${groupId}...`);
  
  try {
    const response = await makeAuthRequest('GET', `/group-chats/groups/${groupId}/messages`);
    console.log('✅ Get group messages successful');
    console.log(`📊 Found ${response.messages.length} messages`);
    return response.messages;
  } catch (error) {
    console.log('❌ Get group messages failed');
    return [];
  }
};

// Test marking messages as read
const testMarkMessagesAsRead = async (groupId: number) => {
  console.log(`\n✅ Testing mark messages as read for group ${groupId}...`);
  
  try {
    const response = await makeAuthRequest('POST', `/group-chats/groups/${groupId}/messages/read`);
    console.log('✅ Mark messages as read successful');
    return true;
  } catch (error) {
    console.log('❌ Mark messages as read failed');
    return false;
  }
};

// Test adding members to group
const testAddMembers = async (groupId: number, connections: any[]) => {
  console.log(`\n➕ Testing add members to group ${groupId}...`);
  
  if (connections.length < 3) {
    console.log('⚠️ Not enough connections to test adding members');
    return false;
  }
  
  try {
    const newMemberIds = [connections[2].id];
    const memberData = { memberIds: newMemberIds };
    
    const response = await makeAuthRequest('POST', `/group-chats/groups/${groupId}/members`, memberData);
    console.log('✅ Add members successful');
    return true;
  } catch (error) {
    console.log('❌ Add members failed');
    return false;
  }
};

// Test removing member from group
const testRemoveMember = async (groupId: number, memberId: number) => {
  console.log(`\n➖ Testing remove member ${memberId} from group ${groupId}...`);
  
  try {
    const response = await makeAuthRequest('DELETE', `/group-chats/groups/${groupId}/members/${memberId}`);
    console.log('✅ Remove member successful');
    return true;
  } catch (error) {
    console.log('❌ Remove member failed');
    return false;
  }
};

// Test leaving group
const testLeaveGroup = async (groupId: number, userIndex: number = 1) => {
  console.log(`\n🚪 Testing leave group ${groupId} (user ${userIndex + 1})...`);
  
  try {
    const response = await makeAuthRequest('POST', `/group-chats/groups/${groupId}/leave`, {}, userIndex);
    console.log('✅ Leave group successful');
    return true;
  } catch (error) {
    console.log('❌ Leave group failed');
    return false;
  }
};

// Test updating group
const testUpdateGroup = async (groupId: number) => {
  console.log(`\n✏️ Testing update group ${groupId}...`);
  
  try {
    const updateData = {
      name: 'Updated Test Study Group',
      description: 'Updated description for the test group'
    };
    
    const response = await makeAuthRequest('PUT', `/group-chats/groups/${groupId}`, updateData);
    console.log('✅ Update group successful');
    return true;
  } catch (error) {
    console.log('❌ Update group failed');
    return false;
  }
};

// Test deleting group
const testDeleteGroup = async (groupId: number) => {
  console.log(`\n🗑️ Testing delete group ${groupId}...`);
  
  try {
    const response = await makeAuthRequest('DELETE', `/group-chats/groups/${groupId}`);
    console.log('✅ Delete group successful');
    return true;
  } catch (error) {
    console.log('❌ Delete group failed');
    return false;
  }
};

// Test updated active conversations endpoint
const testActiveConversations = async () => {
  console.log('\n💬 Testing active conversations (with groups)...');
  
  try {
    const response = await makeAuthRequest('GET', '/chats/active');
    console.log('✅ Get active conversations successful');
    console.log(`📊 Found ${response.conversations.length} conversations`);
    
    const individualChats = response.conversations.filter((conv: any) => conv.type === 'individual');
    const groupChats = response.conversations.filter((conv: any) => conv.type === 'group');
    
    console.log(`👤 Individual chats: ${individualChats.length}`);
    console.log(`👥 Group chats: ${groupChats.length}`);
    
    return response.conversations;
  } catch (error) {
    console.log('❌ Get active conversations failed');
    return [];
  }
};

// Main test function
const runGroupChatTests = async () => {
  console.log('🚀 Starting Group Chat Tests...\n');
  
  try {
    // Test authentication
    await testAuthentication();
    
    if (authTokens.length === 0) {
      console.log('❌ No users authenticated. Cannot proceed with tests.');
      return;
    }
    
    // Test getting connections
    const connections = await testGetConnections();
    
    // Test creating a group
    testGroupId = await testCreateGroup(connections);
    
    if (testGroupId) {
      // Test getting groups
      await testGetGroups();
      
      // Test getting specific group
      await testGetGroup(testGroupId);
      
      // Test sending group message
      await testSendGroupMessage(testGroupId);
      
      // Test getting group messages
      await testGetGroupMessages(testGroupId);
      
      // Test marking messages as read
      await testMarkMessagesAsRead(testGroupId);
      
      // Test adding members
      await testAddMembers(testGroupId, connections);
      
      // Test updating group
      await testUpdateGroup(testGroupId);
      
      // Test active conversations with groups
      await testActiveConversations();
      
      // Test removing member (if we have enough members)
      if (connections.length > 2) {
        await testRemoveMember(testGroupId, connections[2].id);
      }
      
      // Test leaving group (with second user)
      if (authTokens.length > 1) {
        await testLeaveGroup(testGroupId, 1);
      }
      
      // Test deleting group
      await testDeleteGroup(testGroupId);
    }
    
    console.log('\n✅ All Group Chat Tests Completed!');
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runGroupChatTests().then(() => {
    console.log('\n🏁 Test script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Test script failed:', error);
    process.exit(1);
  });
}

export {
  runGroupChatTests,
  testAuthentication,
  testGetConnections,
  testCreateGroup,
  testGetGroups,
  testGetGroup,
  testSendGroupMessage,
  testGetGroupMessages,
  testMarkMessagesAsRead,
  testAddMembers,
  testRemoveMember,
  testLeaveGroup,
  testUpdateGroup,
  testDeleteGroup,
  testActiveConversations
};




































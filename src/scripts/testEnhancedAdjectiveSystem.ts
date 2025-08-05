import axios from 'axios';
import User from '../models/user.model';
import AdjectiveSelection from '../models/adjectiveSelection.model';
import Match from '../models/match.model';
import Connection from '../models/connection.model';

const BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN = 'your-auth-token-here'; // Replace with actual token

async function testEnhancedAdjectiveSystem() {
  console.log('🧪 Testing Enhanced Adjective System...\n');

  try {
    // Test 1: Get user gender
    console.log('1️⃣ Testing Get User Gender...');
    const genderResponse = await axios.get(`${BASE_URL}/enhanced-explore/profile/gender`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('✅ User Gender:', genderResponse.data.gender);

    // Test 2: Get available adjectives for a profile
    console.log('\n2️⃣ Testing Get Available Adjectives...');
    const targetUserId = 2; // Replace with actual user ID
    const adjectivesResponse = await axios.get(`${BASE_URL}/enhanced-explore/adjectives/available/${targetUserId}`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('✅ Available Adjectives:', adjectivesResponse.data.adjectives);
    console.log('✅ Has Previous Selection:', adjectivesResponse.data.hasPreviousSelection);

    // Test 3: Select an adjective
    console.log('\n3️⃣ Testing Adjective Selection...');
    const selectedAdjective = adjectivesResponse.data.adjectives[0];
    const selectResponse = await axios.post(`${BASE_URL}/enhanced-explore/adjectives/select`, {
      targetUserId,
      adjective: selectedAdjective
    }, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('✅ Selection Result:', selectResponse.data.matched ? 'MATCHED!' : 'No match yet');
    if (selectResponse.data.matchData) {
      console.log('✅ Match Data:', selectResponse.data.matchData);
    }

    // Test 4: Get match state
    console.log('\n4️⃣ Testing Get Match State...');
    const matchStateResponse = await axios.get(`${BASE_URL}/enhanced-explore/matches/state/${targetUserId}`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('✅ Match State:', matchStateResponse.data.matchState);

    // Test 5: Get ice-breaking prompt
    if (matchStateResponse.data.matchState) {
      console.log('\n5️⃣ Testing Get Ice-Breaking Prompt...');
      const iceBreakingResponse = await axios.get(`${BASE_URL}/enhanced-explore/matches/ice-breaking/${targetUserId}`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
      });
      console.log('✅ Ice-Breaking Prompt:', iceBreakingResponse.data.prompt);
    }

    // Test 6: Connect after match (if matched)
    if (matchStateResponse.data.matchState && !matchStateResponse.data.matchState.isConnected) {
      console.log('\n6️⃣ Testing Connect After Match...');
      const connectResponse = await axios.post(`${BASE_URL}/enhanced-explore/matches/connect`, {
        targetUserId
      }, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
      });
      console.log('✅ Connection Result:', connectResponse.data.connectionState);
    }

    // Test 7: Get enhanced chat matches
    console.log('\n7️⃣ Testing Enhanced Chat Matches...');
    const chatMatchesResponse = await axios.get(`${BASE_URL}/enhanced-chats/matches`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('✅ Matched Conversations:', chatMatchesResponse.data.conversations.length);

    // Test 8: Get conversation details
    if (chatMatchesResponse.data.conversations.length > 0) {
      console.log('\n8️⃣ Testing Get Conversation Details...');
      const conversationId = chatMatchesResponse.data.conversations[0].id;
      const conversationDetailsResponse = await axios.get(`${BASE_URL}/enhanced-chats/${conversationId}/details`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
      });
      console.log('✅ Conversation Details:', conversationDetailsResponse.data.conversation);
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error: any) {
    console.error('❌ Error testing enhanced adjective system:', error.response?.data || error.message);
  }
}

// Database verification functions
async function verifyDatabaseState() {
  console.log('\n🔍 Verifying Database State...\n');

  try {
    // Check adjective selections
    const selections = await AdjectiveSelection.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'gender'] },
        { model: User, as: 'targetUser', attributes: ['id', 'name', 'gender'] }
      ]
    });

    console.log('📊 Adjective Selections:', selections.length);
    selections.forEach((selection: any) => {
      console.log(`  - ${selection.user.name} (${selection.user.gender}) → ${selection.targetUser.name} (${selection.targetUser.gender}): ${selection.adjective}`);
    });

    // Check matches
    const matches = await Match.findAll({
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'gender'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'gender'] }
      ]
    });

    console.log('\n💕 Matches:', matches.length);
    matches.forEach((match: any) => {
      console.log(`  - ${match.user1.name} ↔ ${match.user2.name}: ${match.mutualAdjective} (Connected: ${match.isConnected})`);
    });

    // Check connections
    const connections = await Connection.findAll({
      where: { status: 'connected' },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name'] },
        { model: User, as: 'user2', attributes: ['id', 'name'] }
      ]
    });

    console.log('\n🔗 Connected Users:', connections.length);
    connections.forEach((connection: any) => {
      console.log(`  - ${connection.user1.name} ↔ ${connection.user2.name}`);
    });

  } catch (error) {
    console.error('❌ Error verifying database state:', error);
  }
}

// Run tests
async function runTests() {
  await testEnhancedAdjectiveSystem();
  await verifyDatabaseState();
}

// Uncomment to run tests
// runTests();

export { testEnhancedAdjectiveSystem, verifyDatabaseState }; 
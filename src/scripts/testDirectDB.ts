import sequelize from '../config/db';
import { Op } from 'sequelize';
import User from '../models/user.model';
import Connection from '../models/connection.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import { setupAssociations } from '../models/associations';

async function testDirectDB() {
  try {
    // Setup associations
    setupAssociations();

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    const userId = 15; // Ankit's ID
    console.log(`🔍 Testing for user ID: ${userId}`);

    // Test 1: Check if user exists
    const user = await User.findByPk(userId);
    console.log(`👤 User found: ${user?.name}`);

    // Test 2: Check connections with status 'connected'
    console.log('\n🔗 Testing connections with status "connected"...');
    const connections = await Connection.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ],
        status: 'connected'
      }
    });

    console.log(`Found ${connections.length} connected users:`);
    connections.forEach((conn, index) => {
      console.log(`  ${index + 1}. ${conn.userId1} <-> ${conn.userId2}, Status: ${conn.status}`);
    });

    // Test 3: Check adjective matches
    console.log('\n💕 Testing adjective matches...');
    const matches = await AdjectiveMatch.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      }
    });

    console.log(`Found ${matches.length} adjective matches:`);
    matches.forEach((match, index) => {
      console.log(`  ${index + 1}. ${match.userId1} <-> ${match.userId2}, Adjective: ${match.adjective}, Matched: ${match.matched}`);
    });

    // Test 4: Check conversations
    console.log('\n💬 Testing conversations...');
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    console.log(`Found ${conversations.length} conversations:`);
    conversations.forEach((conv, index) => {
      console.log(`  ${index + 1}. ${conv.user1Id} <-> ${conv.user2Id}, ID: ${conv.id}`);
    });

    // Test 5: Check messages
    console.log('\n📝 Testing messages...');
    const messages = await Message.findAll({
      include: [
        {
          model: Conversation,
          where: {
            [Op.or]: [
              { user1Id: userId },
              { user2Id: userId }
            ]
          }
        }
      ]
    });

    console.log(`Found ${messages.length} messages:`);
    messages.forEach((msg, index) => {
      console.log(`  ${index + 1}. Text: ${msg.text.substring(0, 50)}..., Sender: ${msg.senderId}, Conversation: ${msg.conversationId}`);
    });

    console.log('\n✅ Direct DB test complete!');

  } catch (error) {
    console.error('❌ Error in direct DB test:', error);
  } finally {
    await sequelize.close();
  }
}

testDirectDB(); 
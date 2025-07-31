import sequelize from '../config/db';
import { Op } from 'sequelize';
import User from '../models/user.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import Connection from '../models/connection.model';
import { setupAssociations } from '../models/associations';

async function debugChatAPI() {
  try {
    // Setup associations
    setupAssociations();

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    const userId = 30; // Test user ID

    console.log('\n🔍 [DEBUG] Testing Chat API for user ID:', userId);

    // 1. Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('✅ User found:', user.name);

    // 2. Check adjective matches
    const matches = await AdjectiveMatch.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'name', 'username']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'name', 'username']
        }
      ]
    });

    console.log(`\n💕 [DEBUG] Found ${matches.length} adjective matches:`);
    for (const match of matches) {
      const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
      const otherUser = await User.findByPk(otherUserId);
      console.log(`  - ${otherUser?.name} (ID: ${otherUserId})`);
    }

    // 3. Check conversations for each match
    console.log('\n💬 [DEBUG] Checking conversations for matches:');
    for (const match of matches) {
      const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
      const otherUser = await User.findByPk(otherUserId);
      
      const conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { user1Id: userId, user2Id: otherUserId },
            { user1Id: otherUserId, user2Id: userId }
          ]
        }
      });

      if (conversation) {
        console.log(`  ✅ Conversation found for ${otherUser?.name}: ${conversation.id}`);
        
        // Check messages
        const messageCount = await Message.count({
          where: { conversationId: conversation.id }
        });
        console.log(`    📝 Messages in conversation: ${messageCount}`);
      } else {
        console.log(`  ❌ No conversation found for ${otherUser?.name}`);
      }
    }

    // 4. Check connections
    const connections = await Connection.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ],
        status: 'connected'
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'name', 'username']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'name', 'username']
        }
      ]
    });

    console.log(`\n🔗 [DEBUG] Found ${connections.length} connections:`);
    for (const connection of connections) {
      const otherUserId = connection.userId1 === userId ? connection.userId2 : connection.userId1;
      const otherUser = await User.findByPk(otherUserId);
      console.log(`  - ${otherUser?.name} (ID: ${otherUserId})`);
    }

    // 5. Check conversations for connections
    console.log('\n💬 [DEBUG] Checking conversations for connections:');
    for (const connection of connections) {
      const otherUserId = connection.userId1 === userId ? connection.userId2 : connection.userId1;
      const otherUser = await User.findByPk(otherUserId);
      
      const conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { user1Id: userId, user2Id: otherUserId },
            { user1Id: otherUserId, user2Id: userId }
          ]
        }
      });

      if (conversation) {
        console.log(`  ✅ Conversation found for ${otherUser?.name}: ${conversation.id}`);
        
        // Check messages
        const messageCount = await Message.count({
          where: { conversationId: conversation.id }
        });
        console.log(`    📝 Messages in conversation: ${messageCount}`);
      } else {
        console.log(`  ❌ No conversation found for ${otherUser?.name}`);
      }
    }

    // 6. List all conversations for this user
    console.log('\n📋 [DEBUG] All conversations for this user:');
    const allConversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    console.log(`Found ${allConversations.length} total conversations:`);
    for (const conv of allConversations) {
      const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
      const otherUser = await User.findByPk(otherUserId);
      console.log(`  - Conversation ${conv.id} with ${otherUser?.name} (ID: ${otherUserId})`);
    }

  } catch (error) {
    console.error('❌ Error debugging chat API:', error);
  } finally {
    await sequelize.close();
  }
}

debugChatAPI(); 
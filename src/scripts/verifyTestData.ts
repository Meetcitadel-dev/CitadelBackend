import sequelize from '../config/db';
import { Op } from 'sequelize';
import User from '../models/user.model';
import Connection from '../models/connection.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import UserOnlineStatus from '../models/userOnlineStatus.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import { setupAssociations } from '../models/associations';

async function verifyTestData() {
  try {
    // Setup associations
    setupAssociations();

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Find Ankit Kumar Ranjan
    const ankit = await User.findOne({
      where: {
        [Op.or]: [
          { name: 'Ankit Kumar Ranjan' },
          { username: 'ankit' },
          { email: { [Op.like]: '%ankit%' } }
        ]
      }
    });

    if (!ankit) {
      console.log('❌ Ankit Kumar Ranjan not found');
      return;
    }

    console.log(`\n👤 Ankit Kumar Ranjan (ID: ${ankit.id})`);

    // Check connections (Active conversations)
    const connections = await Connection.findAll({
      where: {
        [Op.or]: [
          { userId1: ankit.id },
          { userId2: ankit.id }
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

    console.log('\n🔗 Active Conversations (Connected Users):');
    for (const connection of connections) {
      const otherUser = connection.userId1 === ankit.id ? (connection as any).user2 : (connection as any).user1;
      console.log(`- ${otherUser.name} (ID: ${otherUser.id})`);
    }

    // Check adjective matches (Matches conversations)
    const matches = await AdjectiveMatch.findAll({
      where: {
        [Op.or]: [
          { userId1: ankit.id },
          { userId2: ankit.id }
        ],
        matched: true
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

    console.log('\n💕 Matched Conversations:');
    for (const match of matches) {
      const otherUser = match.userId1 === ankit.id ? (match as any).user2 : (match as any).user1;
      console.log(`- ${otherUser.name} (ID: ${otherUser.id}) - ${match.adjective}`);
    }

    // Check conversations
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { user1Id: ankit.id },
          { user2Id: ankit.id }
        ]
      }
    });

    console.log('\n💬 Conversations:');
    for (const conversation of conversations) {
      const otherUserId = conversation.user1Id === ankit.id ? conversation.user2Id : conversation.user1Id;
      const otherUser = await User.findByPk(otherUserId);
      const messageCount = await Message.count({ where: { conversationId: conversation.id } });
      console.log(`- Conversation ${conversation.id}: ${otherUser?.name} (${messageCount} messages)`);
    }

    // Check online users
    const onlineUsers = await UserOnlineStatus.findAll({
      where: { isOnline: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'username']
        }
      ]
    });

    console.log('\n🟢 Online Users:');
    for (const status of onlineUsers) {
      const user = (status as any).user;
      console.log(`- ${user.name} (Last seen: ${status.lastSeen})`);
    }

    // Check total messages
    const totalMessages = await Message.count();
    console.log(`\n📝 Total Messages in Database: ${totalMessages}`);

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error verifying test data:', error);
  } finally {
    await sequelize.close();
  }
}

verifyTestData(); 
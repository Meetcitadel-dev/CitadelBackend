import sequelize from '../config/db';
import { Op } from 'sequelize';
import User from '../models/user.model';
import Connection from '../models/connection.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import UserOnlineStatus from '../models/userOnlineStatus.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import { setupAssociations } from '../models/associations';

async function debugChatAPI() {
  try {
    // Setup associations
    setupAssociations();

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    const userId = 15; // Ankit's ID
    console.log(`🔍 Debugging for user ID: ${userId}`);

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log(`✅ User found: ${user.name}`);

    // Check connections
    console.log('\n🔗 Checking connections...');
    const connections = await Connection.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      }
    });

    console.log(`Found ${connections.length} connections:`);
    connections.forEach(conn => {
      console.log(`- ID: ${conn.id}, User1: ${conn.userId1}, User2: ${conn.userId2}, Status: ${conn.status}`);
    });

    // Check adjective matches
    console.log('\n💕 Checking adjective matches...');
    const matches = await AdjectiveMatch.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      }
    });

    console.log(`Found ${matches.length} matches:`);
    matches.forEach(match => {
      console.log(`- ID: ${match.id}, User1: ${match.userId1}, User2: ${match.userId2}, Adjective: ${match.adjective}, Matched: ${match.matched}`);
    });

    // Check conversations
    console.log('\n💬 Checking conversations...');
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    console.log(`Found ${conversations.length} conversations:`);
    conversations.forEach(conv => {
      console.log(`- ID: ${conv.id}, User1: ${conv.user1Id}, User2: ${conv.user2Id}`);
    });

    // Check messages
    console.log('\n📝 Checking messages...');
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
    messages.forEach(msg => {
      console.log(`- ID: ${msg.id}, Text: ${msg.text.substring(0, 50)}..., Sender: ${msg.senderId}, Conversation: ${msg.conversationId}`);
    });

    // Check online status
    console.log('\n🟢 Checking online status...');
    const onlineStatuses = await UserOnlineStatus.findAll({
      where: { isOnline: true }
    });

    console.log(`Found ${onlineStatuses.length} online users:`);
    onlineStatuses.forEach(status => {
      console.log(`- User ID: ${status.userId}, Online: ${status.isOnline}, Last seen: ${status.lastSeen}`);
    });

    console.log('\n✅ Debug complete!');

  } catch (error) {
    console.error('❌ Error debugging chat API:', error);
  } finally {
    await sequelize.close();
  }
}

debugChatAPI(); 
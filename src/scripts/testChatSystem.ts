import sequelize from '../config/db';
import User from '../models/user.model';
import Connection from '../models/connection.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import UserOnlineStatus from '../models/userOnlineStatus.model';
import { setupAssociations } from '../models/associations';

async function testChatSystem() {
  try {
    // Setup associations
    setupAssociations();

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Create test users
    const user1 = await User.create({
      email: 'testuser1@example.com',
      name: 'Test User 1',
      username: 'testuser1',
      isEmailVerified: true,
      isProfileComplete: true
    });

    const user2 = await User.create({
      email: 'testuser2@example.com',
      name: 'Test User 2',
      username: 'testuser2',
      isEmailVerified: true,
      isProfileComplete: true
    });

    console.log('✅ Test users created:', user1.id, user2.id);

    // Create connection between users
    const connection = await Connection.create({
      userId1: user1.id,
      userId2: user2.id,
      status: 'connected'
    });

    console.log('✅ Connection created between users');

    // Create online status for users
    await UserOnlineStatus.create({
      userId: user1.id,
      isOnline: true,
      lastSeen: new Date()
    });

    await UserOnlineStatus.create({
      userId: user2.id,
      isOnline: false,
      lastSeen: new Date()
    });

    console.log('✅ Online status created for users');

    // Create conversation
    const conversation = await Conversation.create({
      user1Id: user1.id,
      user2Id: user2.id
    });

    console.log('✅ Conversation created:', conversation.id);

    // Send some test messages
    const message1 = await Message.create({
      conversationId: conversation.id,
      senderId: user1.id,
      text: 'Hello! How are you?',
      status: 'sent'
    });

    const message2 = await Message.create({
      conversationId: conversation.id,
      senderId: user2.id,
      text: 'Hi! I\'m doing great, thanks!',
      status: 'sent'
    });

    console.log('✅ Test messages created');

    // Test fetching conversations
    const activeConversations = await Connection.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { userId1: user1.id },
          { userId2: user1.id }
        ],
        status: 'connected'
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'name', 'username'],
          include: [
            {
              model: UserOnlineStatus,
              as: 'onlineStatus',
              attributes: ['isOnline', 'lastSeen']
            }
          ]
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'name', 'username'],
          include: [
            {
              model: UserOnlineStatus,
              as: 'onlineStatus',
              attributes: ['isOnline', 'lastSeen']
            }
          ]
        }
      ]
    });

    console.log('✅ Active conversations fetched:', activeConversations.length);

    // Test fetching messages
    const messages = await Message.findAll({
      where: { conversationId: conversation.id },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'username']
        }
      ]
    });

    console.log('✅ Messages fetched:', messages.length);

    // Clean up test data
    await Message.destroy({ where: { conversationId: conversation.id } });
    await Conversation.destroy({ where: { id: conversation.id } });
    await Connection.destroy({ where: { id: connection.id } });
    await UserOnlineStatus.destroy({ where: { userId: [user1.id, user2.id] } });
    await User.destroy({ where: { id: [user1.id, user2.id] } });

    console.log('✅ Test data cleaned up');
    console.log('🎉 Chat system test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing chat system:', error);
  } finally {
    await sequelize.close();
  }
}

testChatSystem(); 
import sequelize from '../config/db';
import { Op } from 'sequelize';
import User from '../models/user.model';
import Connection from '../models/connection.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import UserOnlineStatus from '../models/userOnlineStatus.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import { setupAssociations } from '../models/associations';

async function createTestConversations() {
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
      console.log('❌ Ankit Kumar Ranjan not found. Available users:');
      const allUsers = await User.findAll({
        attributes: ['id', 'name', 'username', 'email']
      });
      allUsers.forEach(user => {
        console.log(`ID: ${user.id}, Name: ${user.name}, Username: ${user.username}, Email: ${user.email}`);
      });
      return;
    }

    console.log(`✅ Found Ankit: ID ${ankit.id}, Name: ${ankit.name}`);

    // Get all other users
    const otherUsers = await User.findAll({
      where: {
        id: { [Op.ne]: ankit.id }
      },
      attributes: ['id', 'name', 'username', 'email']
    });

    console.log(`✅ Found ${otherUsers.length} other users`);

    // Create connections for some users (for Active conversations)
    const usersForConnections = otherUsers.slice(0, 3); // First 3 users
    for (const user of usersForConnections) {
      await Connection.findOrCreate({
        where: {
          [Op.or]: [
            { userId1: ankit.id, userId2: user.id },
            { userId1: user.id, userId2: ankit.id }
          ]
        },
        defaults: {
          userId1: Math.min(ankit.id, user.id),
          userId2: Math.max(ankit.id, user.id),
          status: 'connected'
        }
      });
      console.log(`✅ Created connection with ${user.name}`);
    }

    // Create adjective matches for some users (for Matches conversations)
    const usersForMatches = otherUsers.slice(3, 6); // Next 3 users
    for (const user of usersForMatches) {
      await AdjectiveMatch.findOrCreate({
        where: {
          [Op.or]: [
            { userId1: ankit.id, userId2: user.id },
            { userId1: user.id, userId2: ankit.id }
          ]
        },
        defaults: {
          userId1: Math.min(ankit.id, user.id),
          userId2: Math.max(ankit.id, user.id),
          adjective: 'friendly',
          matched: true
        }
      });
      console.log(`✅ Created adjective match with ${user.name}`);
    }

    // Create conversations and messages
    const allTestUsers = [...usersForConnections, ...usersForMatches];
    
    for (let i = 0; i < allTestUsers.length; i++) {
      const user = allTestUsers[i];
      
      // Create conversation
      const conversation = await Conversation.findOrCreate({
        where: {
          [Op.or]: [
            { user1Id: ankit.id, user2Id: user.id },
            { user1Id: user.id, user2Id: ankit.id }
          ]
        },
        defaults: {
          user1Id: Math.min(ankit.id, user.id),
          user2Id: Math.max(ankit.id, user.id)
        }
      });

      console.log(`✅ Created conversation with ${user.name}`);

      // Add some test messages
      const messages = [
        `Hi ${user.name}! How are you doing?`,
        `I hope you're having a great day!`,
        `Would you like to grab coffee sometime?`,
        `Let's catch up soon!`
      ];

      for (let j = 0; j < messages.length; j++) {
        const message = messages[j];
        const isFromAnkit = j % 2 === 0; // Alternate between Ankit and other user
        
        await Message.create({
          conversationId: conversation[0].id,
          senderId: isFromAnkit ? ankit.id : user.id,
          text: message,
          status: 'sent'
        });
      }

      console.log(`✅ Added ${messages.length} messages to conversation with ${user.name}`);
    }

    // Create online status for some users
    const onlineUsers = allTestUsers.slice(0, 2); // First 2 users online
    for (const user of onlineUsers) {
      await UserOnlineStatus.findOrCreate({
        where: { userId: user.id },
        defaults: {
          userId: user.id,
          isOnline: true,
          lastSeen: new Date()
        }
      });
      console.log(`✅ Set ${user.name} as online`);
    }

    console.log('\n🎉 Test conversations created successfully!');
    console.log(`📊 Summary:`);
    console.log(`- Active conversations (connected): ${usersForConnections.length}`);
    console.log(`- Matched conversations: ${usersForMatches.length}`);
    console.log(`- Total conversations: ${allTestUsers.length}`);
    console.log(`- Online users: ${onlineUsers.length}`);

  } catch (error) {
    console.error('❌ Error creating test conversations:', error);
  } finally {
    await sequelize.close();
  }
}

createTestConversations(); 
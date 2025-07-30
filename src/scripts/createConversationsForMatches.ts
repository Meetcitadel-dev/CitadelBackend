import sequelize from '../config/db';
import { Op } from 'sequelize';
import User from '../models/user.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import { setupAssociations } from '../models/associations';

async function createConversationsForMatches() {
  try {
    // Setup associations
    setupAssociations();

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    const userId = 15; // Ankit's ID

    // Get all matched users
    const matches = await AdjectiveMatch.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ],
        matched: true
      }
    });

    console.log(`✅ Found ${matches.length} matched users`);

    // Create conversations for matched users
    for (const match of matches) {
      const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
      
      // Get the other user's name
      const otherUser = await User.findByPk(otherUserId);
      
      // Create or find conversation
      const [conversation, created] = await Conversation.findOrCreate({
        where: {
          [Op.or]: [
            { user1Id: userId, user2Id: otherUserId },
            { user1Id: otherUserId, user2Id: userId }
          ]
        },
        defaults: {
          user1Id: Math.min(userId, otherUserId),
          user2Id: Math.max(userId, otherUserId)
        }
      });

      if (created) {
        console.log(`✅ Created new conversation with ${otherUser?.name} (ID: ${conversation.id})`);
        
        // Add a test message
        await Message.create({
          conversationId: conversation.id,
          senderId: userId,
          text: `Hi ${otherUser?.name}! Nice to meet you!`,
          status: 'sent'
        });

        console.log(`✅ Added test message to conversation with ${otherUser?.name}`);
      } else {
        console.log(`⏭️  Conversation already exists with ${otherUser?.name} (ID: ${conversation.id})`);
      }
    }

    console.log('\n✅ Conversations created successfully!');

  } catch (error) {
    console.error('❌ Error creating conversations for matches:', error);
  } finally {
    await sequelize.close();
  }
}

createConversationsForMatches(); 
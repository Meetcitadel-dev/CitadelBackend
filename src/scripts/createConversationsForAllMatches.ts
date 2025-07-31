import sequelize from '../config/db';
import { Op } from 'sequelize';
import User from '../models/user.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import { setupAssociations } from '../models/associations';

async function createConversationsForAllMatches() {
  try {
    // Setup associations
    setupAssociations();

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Get all users who have adjective matches
    const allUsers = await User.findAll({
      attributes: ['id', 'name', 'username']
    });

    console.log(`✅ Found ${allUsers.length} total users`);

    let totalConversationsCreated = 0;
    let totalConversationsSkipped = 0;

    // For each user, create conversations for their matches
    for (const user of allUsers) {
      console.log(`\n🔍 Processing user: ${user.name} (ID: ${user.id})`);

      // Get all matched users for this user
      const matches = await AdjectiveMatch.findAll({
        where: {
          [Op.or]: [
            { userId1: user.id },
            { userId2: user.id }
          ]
        }
      });

      console.log(`  💕 Found ${matches.length} matches for ${user.name}`);

      // Create conversations for each match
      for (const match of matches) {
        const otherUserId = match.userId1 === user.id ? match.userId2 : match.userId1;
        const otherUser = await User.findByPk(otherUserId);
        
        if (!otherUser) {
          console.log(`  ❌ Other user ${otherUserId} not found, skipping`);
          continue;
        }

        // Create or find conversation
        const [conversation, created] = await Conversation.findOrCreate({
          where: {
            [Op.or]: [
              { user1Id: user.id, user2Id: otherUserId },
              { user1Id: otherUserId, user2Id: user.id }
            ]
          },
          defaults: {
            user1Id: Math.min(user.id, otherUserId),
            user2Id: Math.max(user.id, otherUserId)
          }
        });

        if (created) {
          console.log(`  ✅ Created new conversation with ${otherUser.name} (ID: ${conversation.id})`);
          totalConversationsCreated++;
          
          // Add a welcome message
          await Message.create({
            conversationId: conversation.id,
            senderId: user.id,
            text: `Hi ${otherUser.name}! Nice to meet you! 👋`,
            status: 'sent'
          });

          console.log(`  📝 Added welcome message to conversation with ${otherUser.name}`);
        } else {
          console.log(`  ⏭️  Conversation already exists with ${otherUser.name} (ID: ${conversation.id})`);
          totalConversationsSkipped++;
        }
      }
    }

    console.log(`\n🎉 Summary:`);
    console.log(`  ✅ Total conversations created: ${totalConversationsCreated}`);
    console.log(`  ⏭️  Total conversations skipped (already existed): ${totalConversationsSkipped}`);

  } catch (error) {
    console.error('❌ Error creating conversations for all matches:', error);
  } finally {
    await sequelize.close();
  }
}

createConversationsForAllMatches(); 
import sequelize from '../config/db';
import { Op } from 'sequelize';
import User from '../models/user.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import Conversation from '../models/conversation.model';
import { setupAssociations } from '../models/associations';

async function debugMatches() {
  try {
    // Setup associations
    setupAssociations();

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    const userId = 15; // Ankit's ID

    // Check matches with associations
    console.log('\n🔍 Checking matches with associations...');
    const matches = await AdjectiveMatch.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
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

    console.log(`Found ${matches.length} matched conversations:`);
    matches.forEach((match, index) => {
      const otherUser = match.userId1 === userId ? (match as any).user2 : (match as any).user1;
      console.log(`${index + 1}. ${otherUser.name} (ID: ${otherUser.id}) - ${match.adjective}`);
    });

    // Check if conversations exist for these matches
    console.log('\n💬 Checking conversations for matches...');
    for (const match of matches) {
      const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
      const otherUser = match.userId1 === userId ? (match as any).user2 : (match as any).user1;
      
      const conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { user1Id: userId, user2Id: otherUserId },
            { user1Id: otherUserId, user2Id: userId }
          ]
        }
      });

      console.log(`${otherUser.name}: Conversation ${conversation ? 'EXISTS' : 'NOT FOUND'} (${conversation?.id || 'N/A'})`);
    }

    console.log('\n✅ Debug complete!');

  } catch (error) {
    console.error('❌ Error debugging matches:', error);
  } finally {
    await sequelize.close();
  }
}

debugMatches(); 
import sequelize from '../config/db';
import User from '../models/user.model';
import Conversation from '../models/conversation.model';
import UserImage from '../models/userImage.model';
import { Op } from 'sequelize';
import { setupAssociations } from '../models/associations';

async function testConversationDetailsDirect() {
  try {
    // Setup associations
    setupAssociations();
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Test the conversation details logic directly
    const userId = 15; // Ankit
    
    console.log(`Testing conversation details for user ${userId}`);

    // Find existing conversation between user 15 and user 30
    console.log('Finding existing conversation between user 15 and user 30...');
    const existingConversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { user1Id: 15, user2Id: 30 },
          { user1Id: 30, user2Id: 15 }
        ]
      }
    });
    
    if (existingConversation) {
      console.log('✅ Found existing conversation:', existingConversation.id);
      
      // Now test with the existing conversation
      const testConversation = await Conversation.findOne({
        where: {
          id: existingConversation.id,
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (testConversation) {
        // Get the other user's ID
        const otherUserId = testConversation.user1Id === userId ? testConversation.user2Id : testConversation.user1Id;
        console.log(`Other user ID: ${otherUserId}`);

        // Get the other user's details
        const otherUser = await User.findByPk(otherUserId, {
          attributes: ['id', 'name', 'username'],
          include: [
            {
              model: UserImage,
              as: 'images',
              attributes: ['cloudfrontUrl'],
              required: false
            }
          ]
        });

        if (otherUser) {
          const userWithImages = otherUser as any;
          console.log('✅ User found:', {
            id: otherUser.id,
            name: otherUser.name,
            username: otherUser.username,
            profileImage: userWithImages.images?.[0]?.cloudfrontUrl || null
          });

          const result = {
            success: true,
            conversation: {
              id: testConversation.id,
              userId: otherUser.id,
              name: otherUser.name || otherUser.username || 'Unknown User',
              profileImage: userWithImages.images?.[0]?.cloudfrontUrl || null
            }
          };

          console.log('✅ Final result:', result);
        } else {
          console.log('❌ Other user not found');
        }
      } else {
        console.log('❌ Conversation not found or user does not have access');
      }
    } else {
      console.log('❌ No existing conversation found between users 15 and 30');
    }

  } catch (error) {
    console.error('❌ Error testing conversation details:', error);
  } finally {
    await sequelize.close();
  }
}

testConversationDetailsDirect(); 
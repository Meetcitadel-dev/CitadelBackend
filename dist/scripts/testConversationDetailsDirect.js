"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const user_model_1 = __importDefault(require("../models/user.model"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const userImage_model_1 = __importDefault(require("../models/userImage.model"));
const sequelize_1 = require("sequelize");
const associations_1 = require("../models/associations");
async function testConversationDetailsDirect() {
    try {
        // Setup associations
        (0, associations_1.setupAssociations)();
        // Test database connection
        await db_1.default.authenticate();
        console.log('✅ Database connection established successfully.');
        // Test the conversation details logic directly
        const userId = 15; // Ankit
        console.log(`Testing conversation details for user ${userId}`);
        // Find existing conversation between user 15 and user 30
        console.log('Finding existing conversation between user 15 and user 30...');
        const existingConversation = await conversation_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { user1Id: 15, user2Id: 30 },
                    { user1Id: 30, user2Id: 15 }
                ]
            }
        });
        if (existingConversation) {
            console.log('✅ Found existing conversation:', existingConversation.id);
            // Now test with the existing conversation
            const testConversation = await conversation_model_1.default.findOne({
                where: {
                    id: existingConversation.id,
                    [sequelize_1.Op.or]: [
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
                const otherUser = await user_model_1.default.findByPk(otherUserId, {
                    attributes: ['id', 'name', 'username'],
                    include: [
                        {
                            model: userImage_model_1.default,
                            as: 'images',
                            attributes: ['cloudfrontUrl'],
                            required: false
                        }
                    ]
                });
                if (otherUser) {
                    const userWithImages = otherUser;
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
                }
                else {
                    console.log('❌ Other user not found');
                }
            }
            else {
                console.log('❌ Conversation not found or user does not have access');
            }
        }
        else {
            console.log('❌ No existing conversation found between users 15 and 30');
        }
    }
    catch (error) {
        console.error('❌ Error testing conversation details:', error);
    }
    finally {
        await db_1.default.close();
    }
}
testConversationDetailsDirect();

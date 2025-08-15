"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../models/user.model"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const adjectiveMatch_model_1 = __importDefault(require("../models/adjectiveMatch.model"));
const associations_1 = require("../models/associations");
async function createConversationsForMatches() {
    try {
        // Setup associations
        (0, associations_1.setupAssociations)();
        // Test database connection
        await db_1.default.authenticate();
        console.log('✅ Database connection successful');
        const userId = 15; // Ankit's ID
        // Get all matched users
        const matches = await adjectiveMatch_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
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
            const otherUser = await user_model_1.default.findByPk(otherUserId);
            // Create or find conversation
            const [conversation, created] = await conversation_model_1.default.findOrCreate({
                where: {
                    [sequelize_1.Op.or]: [
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
                await message_model_1.default.create({
                    conversationId: conversation.id,
                    senderId: userId,
                    text: `Hi ${otherUser?.name}! Nice to meet you!`,
                    status: 'sent'
                });
                console.log(`✅ Added test message to conversation with ${otherUser?.name}`);
            }
            else {
                console.log(`⏭️  Conversation already exists with ${otherUser?.name} (ID: ${conversation.id})`);
            }
        }
        console.log('\n✅ Conversations created successfully!');
    }
    catch (error) {
        console.error('❌ Error creating conversations for matches:', error);
    }
    finally {
        await db_1.default.close();
    }
}
createConversationsForMatches();

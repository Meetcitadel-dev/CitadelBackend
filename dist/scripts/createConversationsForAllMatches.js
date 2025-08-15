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
async function createConversationsForAllMatches() {
    try {
        // Setup associations
        (0, associations_1.setupAssociations)();
        // Test database connection
        await db_1.default.authenticate();
        console.log('✅ Database connection successful');
        // Get all users who have adjective matches
        const allUsers = await user_model_1.default.findAll({
            attributes: ['id', 'name', 'username']
        });
        console.log(`✅ Found ${allUsers.length} total users`);
        let totalConversationsCreated = 0;
        let totalConversationsSkipped = 0;
        // For each user, create conversations for their matches
        for (const user of allUsers) {
            console.log(`\n🔍 Processing user: ${user.name} (ID: ${user.id})`);
            // Get all matched users for this user
            const matches = await adjectiveMatch_model_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId1: user.id },
                        { userId2: user.id }
                    ]
                }
            });
            console.log(`  💕 Found ${matches.length} matches for ${user.name}`);
            // Create conversations for each match
            for (const match of matches) {
                const otherUserId = match.userId1 === user.id ? match.userId2 : match.userId1;
                const otherUser = await user_model_1.default.findByPk(otherUserId);
                if (!otherUser) {
                    console.log(`  ❌ Other user ${otherUserId} not found, skipping`);
                    continue;
                }
                // Create or find conversation
                const [conversation, created] = await conversation_model_1.default.findOrCreate({
                    where: {
                        [sequelize_1.Op.or]: [
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
                    await message_model_1.default.create({
                        conversationId: conversation.id,
                        senderId: user.id,
                        text: `Hi ${otherUser.name}! Nice to meet you! 👋`,
                        status: 'sent'
                    });
                    console.log(`  📝 Added welcome message to conversation with ${otherUser.name}`);
                }
                else {
                    console.log(`  ⏭️  Conversation already exists with ${otherUser.name} (ID: ${conversation.id})`);
                    totalConversationsSkipped++;
                }
            }
        }
        console.log(`\n🎉 Summary:`);
        console.log(`  ✅ Total conversations created: ${totalConversationsCreated}`);
        console.log(`  ⏭️  Total conversations skipped (already existed): ${totalConversationsSkipped}`);
    }
    catch (error) {
        console.error('❌ Error creating conversations for all matches:', error);
    }
    finally {
        await db_1.default.close();
    }
}
createConversationsForAllMatches();

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
const connection_model_1 = __importDefault(require("../models/connection.model"));
const associations_1 = require("../models/associations");
async function debugChatAPI() {
    try {
        // Setup associations
        (0, associations_1.setupAssociations)();
        // Test database connection
        await db_1.default.authenticate();
        console.log('✅ Database connection successful');
        const userId = 30; // Test user ID
        console.log('\n🔍 [DEBUG] Testing Chat API for user ID:', userId);
        // 1. Check if user exists
        const user = await user_model_1.default.findByPk(userId);
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        console.log('✅ User found:', user.name);
        // 2. Check adjective matches
        const matches = await adjectiveMatch_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: userId },
                    { userId2: userId }
                ]
            },
            include: [
                {
                    model: user_model_1.default,
                    as: 'user1',
                    attributes: ['id', 'name', 'username']
                },
                {
                    model: user_model_1.default,
                    as: 'user2',
                    attributes: ['id', 'name', 'username']
                }
            ]
        });
        console.log(`\n💕 [DEBUG] Found ${matches.length} adjective matches:`);
        for (const match of matches) {
            const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
            const otherUser = await user_model_1.default.findByPk(otherUserId);
            console.log(`  - ${otherUser === null || otherUser === void 0 ? void 0 : otherUser.name} (ID: ${otherUserId})`);
        }
        // 3. Check conversations for each match
        console.log('\n💬 [DEBUG] Checking conversations for matches:');
        for (const match of matches) {
            const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
            const otherUser = await user_model_1.default.findByPk(otherUserId);
            const conversation = await conversation_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { user1Id: userId, user2Id: otherUserId },
                        { user1Id: otherUserId, user2Id: userId }
                    ]
                }
            });
            if (conversation) {
                console.log(`  ✅ Conversation found for ${otherUser === null || otherUser === void 0 ? void 0 : otherUser.name}: ${conversation.id}`);
                // Check messages
                const messageCount = await message_model_1.default.count({
                    where: { conversationId: conversation.id }
                });
                console.log(`    📝 Messages in conversation: ${messageCount}`);
            }
            else {
                console.log(`  ❌ No conversation found for ${otherUser === null || otherUser === void 0 ? void 0 : otherUser.name}`);
            }
        }
        // 4. Check connections
        const connections = await connection_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: userId },
                    { userId2: userId }
                ],
                status: 'connected'
            },
            include: [
                {
                    model: user_model_1.default,
                    as: 'user1',
                    attributes: ['id', 'name', 'username']
                },
                {
                    model: user_model_1.default,
                    as: 'user2',
                    attributes: ['id', 'name', 'username']
                }
            ]
        });
        console.log(`\n🔗 [DEBUG] Found ${connections.length} connections:`);
        for (const connection of connections) {
            const otherUserId = connection.userId1 === userId ? connection.userId2 : connection.userId1;
            const otherUser = await user_model_1.default.findByPk(otherUserId);
            console.log(`  - ${otherUser === null || otherUser === void 0 ? void 0 : otherUser.name} (ID: ${otherUserId})`);
        }
        // 5. Check conversations for connections
        console.log('\n💬 [DEBUG] Checking conversations for connections:');
        for (const connection of connections) {
            const otherUserId = connection.userId1 === userId ? connection.userId2 : connection.userId1;
            const otherUser = await user_model_1.default.findByPk(otherUserId);
            const conversation = await conversation_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { user1Id: userId, user2Id: otherUserId },
                        { user1Id: otherUserId, user2Id: userId }
                    ]
                }
            });
            if (conversation) {
                console.log(`  ✅ Conversation found for ${otherUser === null || otherUser === void 0 ? void 0 : otherUser.name}: ${conversation.id}`);
                // Check messages
                const messageCount = await message_model_1.default.count({
                    where: { conversationId: conversation.id }
                });
                console.log(`    📝 Messages in conversation: ${messageCount}`);
            }
            else {
                console.log(`  ❌ No conversation found for ${otherUser === null || otherUser === void 0 ? void 0 : otherUser.name}`);
            }
        }
        // 6. List all conversations for this user
        console.log('\n📋 [DEBUG] All conversations for this user:');
        const allConversations = await conversation_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            }
        });
        console.log(`Found ${allConversations.length} total conversations:`);
        for (const conv of allConversations) {
            const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
            const otherUser = await user_model_1.default.findByPk(otherUserId);
            console.log(`  - Conversation ${conv.id} with ${otherUser === null || otherUser === void 0 ? void 0 : otherUser.name} (ID: ${otherUserId})`);
        }
    }
    catch (error) {
        console.error('❌ Error debugging chat API:', error);
    }
    finally {
        await db_1.default.close();
    }
}
debugChatAPI();

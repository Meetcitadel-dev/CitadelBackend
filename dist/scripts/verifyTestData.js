"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../models/user.model"));
const connection_model_1 = __importDefault(require("../models/connection.model"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const userOnlineStatus_model_1 = __importDefault(require("../models/userOnlineStatus.model"));
const adjectiveMatch_model_1 = __importDefault(require("../models/adjectiveMatch.model"));
const associations_1 = require("../models/associations");
async function verifyTestData() {
    try {
        // Setup associations
        (0, associations_1.setupAssociations)();
        // Test database connection
        await db_1.default.authenticate();
        console.log('✅ Database connection successful');
        // Find Ankit Kumar Ranjan
        const ankit = await user_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { name: 'Ankit Kumar Ranjan' },
                    { username: 'ankit' },
                    { email: { [sequelize_1.Op.like]: '%ankit%' } }
                ]
            }
        });
        if (!ankit) {
            console.log('❌ Ankit Kumar Ranjan not found');
            return;
        }
        console.log(`\n👤 Ankit Kumar Ranjan (ID: ${ankit.id})`);
        // Check connections (Active conversations)
        const connections = await connection_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: ankit.id },
                    { userId2: ankit.id }
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
        console.log('\n🔗 Active Conversations (Connected Users):');
        for (const connection of connections) {
            const otherUser = connection.userId1 === ankit.id ? connection.user2 : connection.user1;
            console.log(`- ${otherUser.name} (ID: ${otherUser.id})`);
        }
        // Check adjective matches (Matches conversations)
        const matches = await adjectiveMatch_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: ankit.id },
                    { userId2: ankit.id }
                ],
                matched: true
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
        console.log('\n💕 Matched Conversations:');
        for (const match of matches) {
            const otherUser = match.userId1 === ankit.id ? match.user2 : match.user1;
            console.log(`- ${otherUser.name} (ID: ${otherUser.id}) - ${match.adjective}`);
        }
        // Check conversations
        const conversations = await conversation_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { user1Id: ankit.id },
                    { user2Id: ankit.id }
                ]
            }
        });
        console.log('\n💬 Conversations:');
        for (const conversation of conversations) {
            const otherUserId = conversation.user1Id === ankit.id ? conversation.user2Id : conversation.user1Id;
            const otherUser = await user_model_1.default.findByPk(otherUserId);
            const messageCount = await message_model_1.default.count({ where: { conversationId: conversation.id } });
            console.log(`- Conversation ${conversation.id}: ${otherUser === null || otherUser === void 0 ? void 0 : otherUser.name} (${messageCount} messages)`);
        }
        // Check online users
        const onlineUsers = await userOnlineStatus_model_1.default.findAll({
            where: { isOnline: true },
            include: [
                {
                    model: user_model_1.default,
                    as: 'user',
                    attributes: ['id', 'name', 'username']
                }
            ]
        });
        console.log('\n🟢 Online Users:');
        for (const status of onlineUsers) {
            const user = status.user;
            console.log(`- ${user.name} (Last seen: ${status.lastSeen})`);
        }
        // Check total messages
        const totalMessages = await message_model_1.default.count();
        console.log(`\n📝 Total Messages in Database: ${totalMessages}`);
        console.log('\n✅ Verification complete!');
    }
    catch (error) {
        console.error('❌ Error verifying test data:', error);
    }
    finally {
        await db_1.default.close();
    }
}
verifyTestData();

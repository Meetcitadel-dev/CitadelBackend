"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const user_model_1 = __importDefault(require("../models/user.model"));
const connection_model_1 = __importDefault(require("../models/connection.model"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const userOnlineStatus_model_1 = __importDefault(require("../models/userOnlineStatus.model"));
const associations_1 = require("../models/associations");
async function testChatSystem() {
    try {
        // Setup associations
        (0, associations_1.setupAssociations)();
        // Test database connection
        await db_1.default.authenticate();
        console.log('✅ Database connection successful');
        // Create test users
        const user1 = await user_model_1.default.create({
            email: 'testuser1@example.com',
            name: 'Test User 1',
            username: 'testuser1',
            isEmailVerified: true,
            isProfileComplete: true
        });
        const user2 = await user_model_1.default.create({
            email: 'testuser2@example.com',
            name: 'Test User 2',
            username: 'testuser2',
            isEmailVerified: true,
            isProfileComplete: true
        });
        console.log('✅ Test users created:', user1.id, user2.id);
        // Create connection between users
        const connection = await connection_model_1.default.create({
            userId1: user1.id,
            userId2: user2.id,
            status: 'connected'
        });
        console.log('✅ Connection created between users');
        // Create online status for users
        await userOnlineStatus_model_1.default.create({
            userId: user1.id,
            isOnline: true,
            lastSeen: new Date()
        });
        await userOnlineStatus_model_1.default.create({
            userId: user2.id,
            isOnline: false,
            lastSeen: new Date()
        });
        console.log('✅ Online status created for users');
        // Create conversation
        const conversation = await conversation_model_1.default.create({
            user1Id: user1.id,
            user2Id: user2.id
        });
        console.log('✅ Conversation created:', conversation.id);
        // Send some test messages
        const message1 = await message_model_1.default.create({
            conversationId: conversation.id,
            senderId: user1.id,
            text: 'Hello! How are you?',
            status: 'sent'
        });
        const message2 = await message_model_1.default.create({
            conversationId: conversation.id,
            senderId: user2.id,
            text: 'Hi! I\'m doing great, thanks!',
            status: 'sent'
        });
        console.log('✅ Test messages created');
        // Test fetching conversations
        const activeConversations = await connection_model_1.default.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { userId1: user1.id },
                    { userId2: user1.id }
                ],
                status: 'connected'
            },
            include: [
                {
                    model: user_model_1.default,
                    as: 'user1',
                    attributes: ['id', 'name', 'username'],
                    include: [
                        {
                            model: userOnlineStatus_model_1.default,
                            as: 'onlineStatus',
                            attributes: ['isOnline', 'lastSeen']
                        }
                    ]
                },
                {
                    model: user_model_1.default,
                    as: 'user2',
                    attributes: ['id', 'name', 'username'],
                    include: [
                        {
                            model: userOnlineStatus_model_1.default,
                            as: 'onlineStatus',
                            attributes: ['isOnline', 'lastSeen']
                        }
                    ]
                }
            ]
        });
        console.log('✅ Active conversations fetched:', activeConversations.length);
        // Test fetching messages
        const messages = await message_model_1.default.findAll({
            where: { conversationId: conversation.id },
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: user_model_1.default,
                    as: 'sender',
                    attributes: ['id', 'name', 'username']
                }
            ]
        });
        console.log('✅ Messages fetched:', messages.length);
        // Clean up test data
        await message_model_1.default.destroy({ where: { conversationId: conversation.id } });
        await conversation_model_1.default.destroy({ where: { id: conversation.id } });
        await connection_model_1.default.destroy({ where: { id: connection.id } });
        await userOnlineStatus_model_1.default.destroy({ where: { userId: [user1.id, user2.id] } });
        await user_model_1.default.destroy({ where: { id: [user1.id, user2.id] } });
        console.log('✅ Test data cleaned up');
        console.log('🎉 Chat system test completed successfully!');
    }
    catch (error) {
        console.error('❌ Error testing chat system:', error);
    }
    finally {
        await db_1.default.close();
    }
}
testChatSystem();

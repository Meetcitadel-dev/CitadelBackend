"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../models/user.model"));
const connection_model_1 = __importDefault(require("../models/connection.model"));
const adjectiveMatch_model_1 = __importDefault(require("../models/adjectiveMatch.model"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const associations_1 = require("../models/associations");
async function testDirectDB() {
    try {
        // Setup associations
        (0, associations_1.setupAssociations)();
        // Test database connection
        await db_1.default.authenticate();
        console.log('✅ Database connection successful');
        const userId = 15; // Ankit's ID
        console.log(`🔍 Testing for user ID: ${userId}`);
        // Test 1: Check if user exists
        const user = await user_model_1.default.findByPk(userId);
        console.log(`👤 User found: ${user?.name}`);
        // Test 2: Check connections with status 'connected'
        console.log('\n🔗 Testing connections with status "connected"...');
        const connections = await connection_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: userId },
                    { userId2: userId }
                ],
                status: 'connected'
            }
        });
        console.log(`Found ${connections.length} connected users:`);
        connections.forEach((conn, index) => {
            console.log(`  ${index + 1}. ${conn.userId1} <-> ${conn.userId2}, Status: ${conn.status}`);
        });
        // Test 3: Check adjective matches
        console.log('\n💕 Testing adjective matches...');
        const matches = await adjectiveMatch_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: userId },
                    { userId2: userId }
                ]
            }
        });
        console.log(`Found ${matches.length} adjective matches:`);
        matches.forEach((match, index) => {
            console.log(`  ${index + 1}. ${match.userId1} <-> ${match.userId2}, Adjective: ${match.adjective}, Matched: ${match.matched}`);
        });
        // Test 4: Check conversations
        console.log('\n💬 Testing conversations...');
        const conversations = await conversation_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            }
        });
        console.log(`Found ${conversations.length} conversations:`);
        conversations.forEach((conv, index) => {
            console.log(`  ${index + 1}. ${conv.user1Id} <-> ${conv.user2Id}, ID: ${conv.id}`);
        });
        // Test 5: Check messages
        console.log('\n📝 Testing messages...');
        const messages = await message_model_1.default.findAll({
            include: [
                {
                    model: conversation_model_1.default,
                    where: {
                        [sequelize_1.Op.or]: [
                            { user1Id: userId },
                            { user2Id: userId }
                        ]
                    }
                }
            ]
        });
        console.log(`Found ${messages.length} messages:`);
        messages.forEach((msg, index) => {
            console.log(`  ${index + 1}. Text: ${msg.text.substring(0, 50)}..., Sender: ${msg.senderId}, Conversation: ${msg.conversationId}`);
        });
        console.log('\n✅ Direct DB test complete!');
    }
    catch (error) {
        console.error('❌ Error in direct DB test:', error);
    }
    finally {
        await db_1.default.close();
    }
}
testDirectDB();

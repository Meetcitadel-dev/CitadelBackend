"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../models/user.model"));
const adjectiveMatch_model_1 = __importDefault(require("../models/adjectiveMatch.model"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const associations_1 = require("../models/associations");
async function debugMatches() {
    try {
        // Setup associations
        (0, associations_1.setupAssociations)();
        // Test database connection
        await db_1.default.authenticate();
        console.log('✅ Database connection successful');
        const userId = 15; // Ankit's ID
        // Check matches with associations
        console.log('\n🔍 Checking matches with associations...');
        const matches = await adjectiveMatch_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: userId },
                    { userId2: userId }
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
        console.log(`Found ${matches.length} matched conversations:`);
        matches.forEach((match, index) => {
            const otherUser = match.userId1 === userId ? match.user2 : match.user1;
            console.log(`${index + 1}. ${otherUser.name} (ID: ${otherUser.id}) - ${match.adjective}`);
        });
        // Check if conversations exist for these matches
        console.log('\n💬 Checking conversations for matches...');
        for (const match of matches) {
            const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
            const otherUser = match.userId1 === userId ? match.user2 : match.user1;
            const conversation = await conversation_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { user1Id: userId, user2Id: otherUserId },
                        { user1Id: otherUserId, user2Id: userId }
                    ]
                }
            });
            console.log(`${otherUser.name}: Conversation ${conversation ? 'EXISTS' : 'NOT FOUND'} (${(conversation === null || conversation === void 0 ? void 0 : conversation.id) || 'N/A'})`);
        }
        console.log('\n✅ Debug complete!');
    }
    catch (error) {
        console.error('❌ Error debugging matches:', error);
    }
    finally {
        await db_1.default.close();
    }
}
debugMatches();

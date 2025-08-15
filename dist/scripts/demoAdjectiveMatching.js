"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const user_model_1 = __importDefault(require("../models/user.model"));
const adjectiveMatch_model_1 = __importDefault(require("../models/adjectiveMatch.model"));
const associations_1 = require("../models/associations");
const sequelize_1 = require("sequelize");
// Setup model associations
(0, associations_1.setupAssociations)();
async function demoAdjectiveMatching() {
    try {
        console.log('🎭 ADJECTIVE MATCHING DEMONSTRATION\n');
        // Get your profile
        const yourProfile = await user_model_1.default.findOne({
            where: { email: 'ankitranjan_21412@aitpune.edu.in' }
        });
        if (!yourProfile) {
            console.log('❌ Your profile not found');
            return;
        }
        // Get a test user (Priya Sharma)
        const testUser = await user_model_1.default.findOne({
            where: { email: 'priya.sharma_2024@iitm.ac.in' }
        });
        if (!testUser) {
            console.log('❌ Test user not found');
            return;
        }
        console.log('👥 PROFILES:');
        console.log(`   You: ${yourProfile.name} (ID: ${yourProfile.id})`);
        console.log(`   Test User: ${testUser.name} (ID: ${testUser.id})\n`);
        // Simulate you selecting an adjective for Priya
        console.log('📝 STEP 1: You select "Smart" for Priya Sharma');
        const yourSelection = await adjectiveMatch_model_1.default.create({
            userId1: yourProfile.id,
            userId2: testUser.id,
            adjective: 'Smart',
            timestamp: new Date(),
            matched: false
        });
        console.log('✅ Your selection saved to database');
        console.log(`   Record ID: ${yourSelection.id}`);
        console.log(`   Adjective: ${yourSelection.adjective}`);
        console.log(`   Timestamp: ${yourSelection.timestamp}\n`);
        // Check if Priya has selected the same adjective for you
        console.log('🔍 STEP 2: Checking if Priya selected "Smart" for you...');
        const mutualMatch = await adjectiveMatch_model_1.default.findOne({
            where: {
                userId1: testUser.id,
                userId2: yourProfile.id,
                adjective: 'Smart'
            }
        });
        if (mutualMatch) {
            console.log('🎉 MATCH FOUND!');
            console.log('   Both of you selected "Smart" for each other');
            // Update both records as matched
            await yourSelection.update({ matched: true });
            await mutualMatch.update({ matched: true });
            console.log('✅ Both records updated as matched');
            console.log('📱 Both users would receive notifications');
            console.log('💬 This creates a conversation starter!\n');
        }
        else {
            console.log('⏳ No mutual match yet');
            console.log('   Priya hasn\'t selected "Smart" for you yet');
            console.log('   When she does, it will create a match!\n');
        }
        // Show all adjective selections between you two
        console.log('📊 ALL ADJECTIVE SELECTIONS BETWEEN YOU TWO:');
        const allSelections = await adjectiveMatch_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: yourProfile.id, userId2: testUser.id },
                    { userId1: testUser.id, userId2: yourProfile.id }
                ]
            },
            order: [['timestamp', 'DESC']]
        });
        if (allSelections.length === 0) {
            console.log('   No selections found');
        }
        else {
            allSelections.forEach((selection, index) => {
                const direction = selection.userId1 === yourProfile.id ? 'You → Priya' : 'Priya → You';
                const matchStatus = selection.matched ? '✅ MATCHED' : '⏳ Pending';
                console.log(`   ${index + 1}. ${direction}: "${selection.adjective}" ${matchStatus}`);
            });
        }
        console.log('\n🎯 ADJECTIVE MATCHING WORKFLOW:');
        console.log('   1. 👀 You see Priya\'s profile in explore');
        console.log('   2. 🎨 You select "Smart" from the adjective options');
        console.log('   3. 💾 Your selection is saved to database');
        console.log('   4. 🔍 System checks if Priya selected "Smart" for you');
        console.log('   5. 🎉 If yes → MATCH! Both get notified');
        console.log('   6. 💬 If no → Wait for mutual selection');
        console.log('\n🌟 BENEFITS:');
        console.log('   • 🎯 Discover shared personality traits');
        console.log('   • 💬 Natural conversation starters');
        console.log('   • 🎉 Real-time mutual interest discovery');
        console.log('   • 📱 Instant notifications when matches occur');
        console.log('   • 🤝 Build connections beyond academics');
        console.log('\n🚀 READY TO TEST IN YOUR APP!');
        console.log('   • Go to explore screen');
        console.log('   • Select adjectives for different users');
        console.log('   • Watch for mutual matches in real-time');
    }
    catch (error) {
        console.error('Error in adjective matching demo:', error);
    }
    finally {
        process.exit(0);
    }
}
demoAdjectiveMatching();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const user_model_1 = __importDefault(require("../models/user.model"));
const university_model_1 = __importDefault(require("../models/university.model"));
const associations_1 = require("../models/associations");
const sequelize_1 = require("sequelize");
// Setup model associations
(0, associations_1.setupAssociations)();
// Calculate match score between two users (same as in controller)
const calculateMatchScore = (user1, user2) => {
    let score = 0;
    // Same college + same year + same degree (Score: 1.0)
    if (user1.universityId === user2.universityId &&
        user1.year === user2.year &&
        user1.degree === user2.degree) {
        score = 1.0;
    }
    // Same college + same year (Score: 0.7)
    else if (user1.universityId === user2.universityId &&
        user1.year === user2.year) {
        score = 0.7;
    }
    // Same college (Score: 0.4)
    else if (user1.universityId === user2.universityId) {
        score = 0.4;
    }
    // Same city + same degree + same year (Score: 0.3)
    else if (user1.university?.country === user2.university?.country &&
        user1.degree === user2.degree &&
        user1.year === user2.year) {
        score = 0.3;
    }
    // Same city + same year (Score: 0.2)
    else if (user1.university?.country === user2.university?.country &&
        user1.year === user2.year) {
        score = 0.2;
    }
    // Same city (Score: 0.1)
    else if (user1.university?.country === user2.university?.country) {
        score = 0.1;
    }
    return score;
};
async function testExploreSystem() {
    try {
        console.log('🔍 TESTING EXPLORE SYSTEM RATING ALGORITHM\n');
        // Get your profile (Ankit Kumar Ranjan)
        const yourProfile = await user_model_1.default.findOne({
            where: { email: 'ankitranjan_21412@aitpune.edu.in' },
            include: [{ model: university_model_1.default, as: 'university' }]
        });
        if (!yourProfile) {
            console.log('❌ Your profile not found. Please make sure you are logged in.');
            return;
        }
        console.log('👤 YOUR PROFILE:');
        console.log(`   Name: ${yourProfile.name}`);
        console.log(`   University: ${yourProfile.university?.name}`);
        console.log(`   Degree: ${yourProfile.degree}`);
        console.log(`   Year: ${yourProfile.year}`);
        console.log(`   Country: ${yourProfile.university?.country}\n`);
        // Get all test users
        const testUsers = await user_model_1.default.findAll({
            where: {
                email: {
                    [sequelize_1.Op.like]: '%@iit%'
                }
            },
            include: [{ model: university_model_1.default, as: 'university' }]
        });
        console.log('📊 MATCH SCORES FOR ALL PROFILES:\n');
        const profilesWithScores = testUsers.map(user => {
            const score = calculateMatchScore(yourProfile, user);
            return {
                name: user.name,
                university: user.university?.name,
                degree: user.degree,
                year: user.year,
                country: user.university?.country,
                score: score,
                matchReason: getMatchReason(score, yourProfile, user)
            };
        });
        // Sort by score (highest first)
        profilesWithScores.sort((a, b) => b.score - a.score);
        // Display results
        profilesWithScores.forEach((profile, index) => {
            const scorePercentage = (profile.score * 100).toFixed(0);
            const stars = '⭐'.repeat(Math.ceil(profile.score * 5));
            console.log(`${index + 1}. ${profile.name}`);
            console.log(`   🏫 ${profile.university} (${profile.country})`);
            console.log(`   📚 ${profile.degree} - ${profile.year} year`);
            console.log(`   🎯 Match Score: ${profile.score} (${scorePercentage}%) ${stars}`);
            console.log(`   💡 Reason: ${profile.matchReason}\n`);
        });
        // Test adjective matching
        console.log('🎭 TESTING ADJECTIVE MATCHING SYSTEM:\n');
        const ADJECTIVES = [
            'Smart', 'Creative', 'Funny', 'Ambitious', 'Kind',
            'Adventurous', 'Reliable', 'Witty', 'Thoughtful', 'Bold',
            'Genuine', 'Energetic', 'Calm', 'Inspiring', 'Curious'
        ];
        // Simulate selecting adjectives for some users
        const testAdjectives = [
            { userId: profilesWithScores[0].name, adjective: 'Smart' },
            { userId: profilesWithScores[1].name, adjective: 'Creative' },
            { userId: profilesWithScores[2].name, adjective: 'Ambitious' }
        ];
        console.log('📝 SIMULATED ADJECTIVE SELECTIONS:');
        testAdjectives.forEach((selection, index) => {
            console.log(`${index + 1}. You selected "${selection.adjective}" for ${selection.userId}`);
        });
        console.log('\n🎯 WHAT HAPPENS WHEN YOU SELECT AN ADJECTIVE:');
        console.log('   1. ✅ Your selection is saved to the database');
        console.log('   2. 🔍 System checks if the other person selected the same adjective for you');
        console.log('   3. 🎉 If both select the same adjective → MATCH!');
        console.log('   4. 📱 Both users get notified of the mutual interest');
        console.log('   5. 💬 This creates a conversation starter');
        console.log('\n📈 MATCHING ALGORITHM BREAKDOWN:');
        console.log('   🏆 Perfect Match (1.0): Same university + same year + same degree');
        console.log('   🥈 Great Match (0.7): Same university + same year');
        console.log('   🥉 Good Match (0.4): Same university');
        console.log('   📍 Decent Match (0.3): Same country + same degree + same year');
        console.log('   🤝 Okay Match (0.2): Same country + same year');
        console.log('   🌍 Basic Match (0.1): Same country');
        console.log('\n🎨 ADJECTIVE MATCHING BENEFITS:');
        console.log('   • 🎯 Discover shared interests beyond academics');
        console.log('   • 💬 Natural conversation starters');
        console.log('   • 🎉 Real-time mutual interest discovery');
        console.log('   • 📱 Instant notifications when matches occur');
        console.log('\n🚀 READY TO TEST!');
        console.log('   • Visit your explore screen to see these profiles');
        console.log('   • Try selecting adjectives for different users');
        console.log('   • Watch for mutual matches in real-time');
    }
    catch (error) {
        console.error('Error testing explore system:', error);
    }
    finally {
        process.exit(0);
    }
}
function getMatchReason(score, user1, user2) {
    if (score === 1.0) {
        return `Perfect match! Same university (${user2.university?.name}), same year (${user2.year}), same degree (${user2.degree})`;
    }
    else if (score === 0.7) {
        return `Great match! Same university (${user2.university?.name}), same year (${user2.year})`;
    }
    else if (score === 0.4) {
        return `Good match! Same university (${user2.university?.name})`;
    }
    else if (score === 0.3) {
        return `Decent match! Same country (${user2.university?.country}), same degree (${user2.degree}), same year (${user2.year})`;
    }
    else if (score === 0.2) {
        return `Okay match! Same country (${user2.university?.country}), same year (${user2.year})`;
    }
    else if (score === 0.1) {
        return `Basic match! Same country (${user2.university?.country})`;
    }
    else {
        return 'No specific match criteria met';
    }
}
testExploreSystem();

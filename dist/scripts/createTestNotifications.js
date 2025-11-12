"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const connectionRequest_model_1 = __importDefault(require("../models/connectionRequest.model"));
const adjectiveMatch_model_1 = __importDefault(require("../models/adjectiveMatch.model"));
const interaction_model_1 = __importDefault(require("../models/interaction.model"));
async function createTestNotifications() {
    try {
        console.log('Creating test notification data for Ankit Kumar Ranjan...\n');
        // Find Ankit Kumar Ranjan (current user)
        const ankit = await user_model_1.default.findOne({
            where: {
                name: 'Ankit Kumar Ranjan'
            }
        });
        if (!ankit) {
            console.log('❌ Ankit Kumar Ranjan not found in database');
            console.log('Available users:');
            const allUsers = await user_model_1.default.findAll();
            allUsers.forEach(user => {
                console.log(`- ${user.name} (ID: ${user.id})`);
            });
            return;
        }
        console.log(`✅ Found Ankit Kumar Ranjan (ID: ${ankit.id})`);
        // Get all other users
        const otherUsers = await user_model_1.default.findAll({
            where: {
                id: { [require('sequelize').Op.ne]: ankit.id }
            }
        });
        console.log(`Found ${otherUsers.length} other users`);
        // Create connection requests from other users to Ankit
        console.log('\n📝 Creating connection requests...');
        for (let i = 0; i < Math.min(5, otherUsers.length); i++) {
            const user = otherUsers[i];
            const [request, created] = await connectionRequest_model_1.default.findOrCreate({
                where: {
                    requesterId: user.id,
                    targetId: ankit.id,
                    status: 'pending'
                },
                defaults: {
                    requesterId: user.id,
                    targetId: ankit.id,
                    status: 'pending'
                }
            });
            if (created) {
                console.log(`✅ Created connection request from ${user.name} to Ankit`);
            }
            else {
                console.log(`ℹ️  Connection request from ${user.name} already exists`);
            }
        }
        // Create adjective selections for Ankit
        console.log('\n🎭 Creating adjective selections...');
        const adjectives = ['Funny', 'Smart', 'Creative', 'Ambitious', 'Kind', 'Adventurous'];
        for (let i = 0; i < Math.min(6, otherUsers.length); i++) {
            const user = otherUsers[i];
            const adjective = adjectives[i % adjectives.length];
            const [adjectiveMatch, created] = await adjectiveMatch_model_1.default.findOrCreate({
                where: {
                    userId1: user.id,
                    userId2: ankit.id,
                    adjective: adjective
                },
                defaults: {
                    userId1: user.id,
                    userId2: ankit.id,
                    adjective: adjective,
                    timestamp: new Date(),
                    matched: false
                }
            });
            if (created) {
                console.log(`✅ ${user.name} selected "${adjective}" for Ankit`);
            }
            else {
                console.log(`ℹ️  ${user.name} already selected "${adjective}" for Ankit`);
            }
            // Also create interaction record
            await interaction_model_1.default.findOrCreate({
                where: {
                    userId: user.id,
                    targetUserId: ankit.id,
                    interactionType: 'adjective_selected'
                },
                defaults: {
                    userId: user.id,
                    targetUserId: ankit.id,
                    interactionType: 'adjective_selected',
                    timestamp: new Date()
                }
            });
        }
        // Create some accepted connection requests to show variety
        console.log('\n✅ Creating some accepted connection requests...');
        if (otherUsers.length > 6) {
            for (let i = 6; i < Math.min(8, otherUsers.length); i++) {
                const user = otherUsers[i];
                await connectionRequest_model_1.default.findOrCreate({
                    where: {
                        requesterId: user.id,
                        targetId: ankit.id
                    },
                    defaults: {
                        requesterId: user.id,
                        targetId: ankit.id,
                        status: 'accepted'
                    }
                });
                console.log(`✅ ${user.name} connection request accepted`);
            }
        }
        // Create some rejected connection requests
        console.log('\n❌ Creating some rejected connection requests...');
        if (otherUsers.length > 8) {
            for (let i = 8; i < Math.min(10, otherUsers.length); i++) {
                const user = otherUsers[i];
                await connectionRequest_model_1.default.findOrCreate({
                    where: {
                        requesterId: user.id,
                        targetId: ankit.id
                    },
                    defaults: {
                        requesterId: user.id,
                        targetId: ankit.id,
                        status: 'rejected'
                    }
                });
                console.log(`❌ ${user.name} connection request rejected`);
            }
        }
        console.log('\n🎉 Test notification data created successfully!');
        console.log('\n📊 Summary:');
        console.log('- Connection requests (pending): 5');
        console.log('- Adjective selections: 6 different adjectives');
        console.log('- Accepted requests: 2');
        console.log('- Rejected requests: 2');
        console.log('\n🔗 You can now test:');
        console.log('1. View notifications in your frontend');
        console.log('2. Accept/reject connection requests');
        console.log('3. See adjective notifications grouped by type');
        console.log('4. Mark notifications as read');
    }
    catch (error) {
        console.error('❌ Error creating test data:', error);
    }
}
createTestNotifications();

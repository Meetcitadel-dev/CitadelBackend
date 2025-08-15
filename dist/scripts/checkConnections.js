"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const user_model_1 = __importDefault(require("../models/user.model"));
const connection_model_1 = __importDefault(require("../models/connection.model"));
const associations_1 = require("../models/associations");
const sequelize_1 = require("sequelize");
// Setup model associations
(0, associations_1.setupAssociations)();
async function checkConnections() {
    try {
        console.log('🔍 CHECKING CONNECTION STATUS\n');
        // Get your profile
        const yourProfile = await user_model_1.default.findOne({
            where: { email: 'ankitranjan_21412@aitpune.edu.in' }
        });
        if (!yourProfile) {
            console.log('❌ Your profile not found');
            return;
        }
        console.log('👤 YOUR PROFILE:');
        console.log(`   Name: ${yourProfile.name} (ID: ${yourProfile.id})\n`);
        // Get all connections involving you
        const allConnections = await connection_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: yourProfile.id },
                    { userId2: yourProfile.id }
                ]
            },
            include: [
                {
                    model: user_model_1.default,
                    as: 'user1',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: user_model_1.default,
                    as: 'user2',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        console.log('📊 ALL CONNECTIONS INVOLVING YOU:\n');
        if (allConnections.length === 0) {
            console.log('   No connections found');
        }
        else {
            allConnections.forEach((connection, index) => {
                const otherUser = connection.userId1 === yourProfile.id
                    ? connection.user2
                    : connection.user1;
                const direction = connection.userId1 === yourProfile.id ? 'You →' : '→ You';
                console.log(`${index + 1}. ${direction} ${otherUser?.name || `User ${connection.userId2}`}`);
                console.log(`   Status: ${connection.status}`);
                console.log(`   Created: ${connection.createdAt}`);
                console.log(`   Connection ID: ${connection.id}\n`);
            });
        }
        // Check specific connection with Ananya Gupta
        console.log('🎯 SPECIFIC CONNECTION WITH ANANYA GUPTA:\n');
        const ananyaConnection = await connection_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: yourProfile.id, userId2: 22 }, // Ananya's ID
                    { userId1: 22, userId2: yourProfile.id }
                ]
            }
        });
        if (ananyaConnection) {
            console.log('✅ Connection found with Ananya Gupta');
            console.log(`   Status: ${ananyaConnection.status}`);
            console.log(`   Created: ${ananyaConnection.createdAt}`);
            console.log(`   Connection ID: ${ananyaConnection.id}`);
            if (ananyaConnection.status === 'requested') {
                console.log('   📤 You have a pending connection request with Ananya');
            }
            else if (ananyaConnection.status === 'connected') {
                console.log('   ✅ You are connected with Ananya');
            }
            else if (ananyaConnection.status === 'blocked') {
                console.log('   🚫 Connection is blocked');
            }
        }
        else {
            console.log('❌ No connection found with Ananya Gupta');
        }
        console.log('\n💡 WHAT THIS MEANS:');
        console.log('• If status is "requested" → You already sent a connection request');
        console.log('• If status is "connected" → You are already connected');
        console.log('• If status is "blocked" → Connection is blocked');
        console.log('• If no connection → You can send a new request');
        console.log('\n🚀 NEXT STEPS:');
        console.log('• If connection exists → Frontend should show appropriate button');
        console.log('• If no connection → You can send a new request');
        console.log('• Try different users if this one already has a connection');
    }
    catch (error) {
        console.error('Error checking connections:', error);
    }
    finally {
        process.exit(0);
    }
}
checkConnections();

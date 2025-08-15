"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
async function showUsers() {
    try {
        console.log('📋 Current users in database:\n');
        const users = await user_model_1.default.findAll({
            order: [['id', 'ASC']]
        });
        if (users.length === 0) {
            console.log('❌ No users found in database');
            return;
        }
        console.log(`✅ Found ${users.length} users:\n`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (ID: ${user.id})`);
            console.log(`   Email: ${user.email}`);
            console.log(`   University ID: ${user.universityId || 'Not set'}`);
            console.log(`   Profile Complete: ${user.isProfileComplete ? 'Yes' : 'No'}`);
            console.log(`   Created: ${user.createdAt?.toLocaleDateString()}`);
            console.log('');
        });
        // Check if Ankit exists
        const ankit = users.find(user => user.name === 'Ankit Kumar Ranjan');
        if (ankit) {
            console.log('🎯 Ankit Kumar Ranjan found! Ready to create test notifications.');
        }
        else {
            console.log('⚠️  Ankit Kumar Ranjan not found. You may need to create this user first.');
        }
    }
    catch (error) {
        console.error('❌ Error fetching users:', error);
    }
}
showUsers();

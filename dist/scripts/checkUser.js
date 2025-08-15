"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const associations_1 = require("../models/associations");
const user_model_1 = __importDefault(require("../models/user.model"));
async function checkUser() {
    try {
        console.log('🔍 Checking User ID 30...');
        // Setup associations
        (0, associations_1.setupAssociations)();
        // Check if user 30 exists
        const user = await user_model_1.default.findByPk(30);
        if (user) {
            console.log('✅ User 30 found:', {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username
            });
        }
        else {
            console.log('❌ User 30 not found');
            // List all users
            const allUsers = await user_model_1.default.findAll({
                attributes: ['id', 'name', 'email', 'username'],
                limit: 10
            });
            console.log('📋 Available users:');
            allUsers.forEach(u => {
                console.log(`  ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
            });
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await db_1.default.close();
    }
}
checkUser();

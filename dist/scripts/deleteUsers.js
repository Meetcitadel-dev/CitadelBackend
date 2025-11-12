"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const user_model_1 = __importDefault(require("../models/user.model"));
async function deleteAllUsers() {
    try {
        // Test database connection
        await db_1.default.authenticate();
        console.log('✅ Database connection established successfully.');
        // Get count before deletion
        const userCount = await user_model_1.default.count();
        console.log(`📊 Found ${userCount} users in database`);
        if (userCount === 0) {
            console.log('ℹ️  No users to delete.');
            return;
        }
        // Delete all users
        const deletedCount = await user_model_1.default.destroy({
            where: {},
            truncate: false
        });
        console.log(`🗑️  Successfully deleted ${deletedCount} users from database`);
        console.log('✅ Users table is now empty');
    }
    catch (error) {
        console.error('❌ Error deleting users:', error);
    }
    finally {
        await db_1.default.close();
    }
}
// Run the script
deleteAllUsers();

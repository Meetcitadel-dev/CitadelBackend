"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
async function resetAutoIncrement() {
    try {
        // Test database connection
        await db_1.default.authenticate();
        console.log('✅ Database connection established successfully.');
        // Reset auto-increment for users table
        await db_1.default.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
        console.log('✅ Reset users auto-increment to 1');
        // Reset auto-increment for user_images table
        await db_1.default.query('ALTER SEQUENCE user_images_id_seq RESTART WITH 1');
        console.log('✅ Reset user_images auto-increment to 1');
        console.log('✅ Auto-increment counters reset successfully!');
    }
    catch (error) {
        console.error('❌ Error resetting auto-increment:', error);
    }
    finally {
        await db_1.default.close();
    }
}
// Run the script
resetAutoIncrement();

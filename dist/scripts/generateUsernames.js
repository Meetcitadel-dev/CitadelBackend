"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const userProfile_controller_1 = require("../controllers/userProfile.controller");
async function generateUsernamesForExistingUsers() {
    try {
        console.log('🔧 Generating usernames for existing users...');
        // Find all users without usernames
        const usersWithoutUsername = await user_model_1.default.findAll({
            where: {
                username: null
            }
        });
        console.log(`Found ${usersWithoutUsername.length} users without usernames`);
        for (const user of usersWithoutUsername) {
            if (user.name) {
                const username = await (0, userProfile_controller_1.generateUsername)(user.name);
                await user.update({ username });
                console.log(`Generated username "${username}" for user "${user.name}" (ID: ${user.id})`);
            }
            else {
                // Generate username from email if no name
                const emailUsername = user.email.split('@')[0];
                const username = await (0, userProfile_controller_1.generateUsername)(emailUsername);
                await user.update({ username });
                console.log(`Generated username "${username}" for user with email "${user.email}" (ID: ${user.id})`);
            }
        }
        console.log('✅ Username generation completed successfully!');
    }
    catch (error) {
        console.error('❌ Error generating usernames:', error);
    }
}
// Run the script if called directly
if (require.main === module) {
    generateUsernamesForExistingUsers()
        .then(() => {
        console.log('Script completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
}
exports.default = generateUsernamesForExistingUsers;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const sequelize_1 = require("sequelize");
const adjectiveMatch_model_1 = __importDefault(require("../models/adjectiveMatch.model"));
const associations_1 = require("../models/associations");
async function fixMatches() {
    try {
        // Setup associations
        (0, associations_1.setupAssociations)();
        // Test database connection
        await db_1.default.authenticate();
        console.log('✅ Database connection successful');
        const userId = 15; // Ankit's ID
        // Update existing matches to be matched: true
        const updatedMatches = await adjectiveMatch_model_1.default.update({ matched: true }, {
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: userId },
                    { userId2: userId }
                ],
                matched: false
            }
        });
        console.log(`✅ Updated ${updatedMatches[0]} matches to matched: true`);
        // Verify the update
        const matches = await adjectiveMatch_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: userId },
                    { userId2: userId }
                ],
                matched: true
            }
        });
        console.log(`✅ Now have ${matches.length} matched conversations`);
        console.log('\n✅ Matches fixed successfully!');
    }
    catch (error) {
        console.error('❌ Error fixing matches:', error);
    }
    finally {
        await db_1.default.close();
    }
}
fixMatches();

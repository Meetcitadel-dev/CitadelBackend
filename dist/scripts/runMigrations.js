"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
require("../models/user.model");
require("../models/university.model");
require("../models/userImage.model");
require("../models/connection.model");
require("../models/adjectiveMatch.model");
async function runMigrations() {
    try {
        console.log('Starting migrations...');
        // Sync all models with database
        await db_1.default.sync({ alter: true });
        console.log('Migrations completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
runMigrations();

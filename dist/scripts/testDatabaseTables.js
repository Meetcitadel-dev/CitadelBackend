"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
require("../models"); // Import all models
async function testDatabaseTables() {
    try {
        console.log('🔍 Testing database tables...');
        // Test if we can connect to the database
        await db_1.default.authenticate();
        console.log('✅ Database connection successful');
        // Test if the adjective_selections table exists
        const [results] = await db_1.default.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('adjective_selections', 'matches', 'users')
    `);
        console.log('📋 Available tables:', results);
        // Test if we can query the adjective_selections table
        const [adjectiveResults] = await db_1.default.query(`
      SELECT COUNT(*) as count FROM adjective_selections
    `);
        console.log('📊 Adjective selections count:', adjectiveResults);
        // Test if we can query the matches table
        const [matchResults] = await db_1.default.query(`
      SELECT COUNT(*) as count FROM matches
    `);
        console.log('📊 Matches count:', matchResults);
        console.log('✅ All database tests passed!');
    }
    catch (error) {
        console.error('❌ Database test failed:', error);
    }
    finally {
        await db_1.default.close();
    }
}
testDatabaseTables();

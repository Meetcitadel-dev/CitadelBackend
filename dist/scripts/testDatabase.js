"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const testDatabaseConnection = async () => {
    console.log('🔍 Testing Database Connection...\n');
    try {
        // Test the connection
        await db_1.default.authenticate();
        console.log('✅ Database connection successful');
        // Test a simple query
        const result = await db_1.default.query('SELECT 1 as test');
        console.log('✅ Database query successful:', result[0]);
    }
    catch (error) {
        console.log('❌ Database connection failed:', error.message);
        console.log('Error details:', error);
    }
    finally {
        await db_1.default.close();
    }
};
testDatabaseConnection().catch(console.error);

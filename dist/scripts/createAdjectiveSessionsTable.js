"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = __importDefault(require("../config/db"));
async function createAdjectiveSessionsTable() {
    try {
        console.log('🔧 Creating adjective_sessions table...');
        // Check if table already exists
        const [results] = await db_1.default.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'adjective_sessions'
    `);
        if (results.length > 0) {
            console.log('✅ Table adjective_sessions already exists!');
            return;
        }
        // Create the table
        await db_1.default.query(`
      CREATE TABLE adjective_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id),
        target_user_id INTEGER NOT NULL REFERENCES users(id),
        session_id VARCHAR(255) NOT NULL,
        adjectives JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
        UNIQUE(user_id, target_user_id, session_id)
      )
    `);
        // Create indexes
        await db_1.default.query(`
      CREATE INDEX adjective_sessions_user_id_index ON adjective_sessions (user_id)
    `);
        await db_1.default.query(`
      CREATE INDEX adjective_sessions_target_user_id_index ON adjective_sessions (target_user_id)
    `);
        await db_1.default.query(`
      CREATE INDEX adjective_sessions_session_id_index ON adjective_sessions (session_id)
    `);
        await db_1.default.query(`
      CREATE INDEX adjective_sessions_expires_at_index ON adjective_sessions (expires_at)
    `);
        console.log('✅ Table adjective_sessions created successfully!');
        console.log('✅ All indexes created successfully!');
    }
    catch (error) {
        console.error('❌ Error creating table:', error);
    }
    finally {
        await db_1.default.close();
    }
}
createAdjectiveSessionsTable();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = __importDefault(require("../config/db"));
const sequelize_1 = require("sequelize");
async function runMigration() {
    try {
        console.log('🔄 Running migration: create-user-unread-counts');
        const queryInterface = db_1.default.getQueryInterface();
        // Create the table
        await queryInterface.createTable('user_unread_counts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: sequelize_1.DataTypes.INTEGER
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            chatId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                comment: 'Group ID for group chats, User ID for direct chats'
            },
            isGroup: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'true for group chats, false for direct chats'
            },
            unreadCount: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            lastMessageId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: 'ID of the last unread message'
            },
            createdAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE
            }
        });
        // Add indexes for fast lookups
        await queryInterface.addIndex('user_unread_counts', ['userId']);
        await queryInterface.addIndex('user_unread_counts', ['chatId']);
        await queryInterface.addIndex('user_unread_counts', ['userId', 'chatId', 'isGroup']);
        // Add unique constraint
        await queryInterface.addConstraint('user_unread_counts', {
            fields: ['userId', 'chatId', 'isGroup'],
            type: 'unique',
            name: 'user_unread_counts_userId_chatId_isGroup_unique'
        });
        console.log('✅ Migration completed successfully!');
        console.log('📊 Created table: user_unread_counts');
        console.log('📊 Added indexes and constraints');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
    }
    finally {
        await db_1.default.close();
    }
}
runMigration();

import dotenv from 'dotenv';
dotenv.config();
import sequelize from '../config/db';
import { QueryInterface, DataTypes } from 'sequelize';

async function runMigration() {
  try {
    console.log('🔄 Running migration: create-user-unread-counts');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Create the table
    await queryInterface.createTable('user_unread_counts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Group ID for group chats, User ID for direct chats'
      },
      isGroup: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'true for group chats, false for direct chats'
      },
      unreadCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      lastMessageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID of the last unread message'
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
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
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();




















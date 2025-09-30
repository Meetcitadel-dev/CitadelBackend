'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_unread_counts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      chatId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Group ID for group chats, User ID for direct chats'
      },
      isGroup: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'true for group chats, false for direct chats'
      },
      unreadCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      lastMessageId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID of the last unread message'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_unread_counts');
  }
};












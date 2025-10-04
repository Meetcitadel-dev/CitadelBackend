'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('adjective_sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
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
      targetUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sessionId: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      adjectives: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: 'Array of 4 adjectives for this session'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW() + INTERVAL \'24 hours\'')
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('adjective_sessions', {
      fields: ['userId', 'targetUserId', 'sessionId'],
      unique: true,
      name: 'adjective_sessions_user_target_session_unique'
    });

    await queryInterface.addIndex('adjective_sessions', {
      fields: ['userId'],
      name: 'adjective_sessions_user_id_index'
    });

    await queryInterface.addIndex('adjective_sessions', {
      fields: ['targetUserId'],
      name: 'adjective_sessions_target_user_id_index'
    });

    await queryInterface.addIndex('adjective_sessions', {
      fields: ['sessionId'],
      name: 'adjective_sessions_session_id_index'
    });

    await queryInterface.addIndex('adjective_sessions', {
      fields: ['expiresAt'],
      name: 'adjective_sessions_expires_at_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('adjective_sessions');
  }
};












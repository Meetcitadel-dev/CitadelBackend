'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('matches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId1: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId2: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      mutualAdjective: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      isConnected: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      matchTimestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      connectionTimestamp: {
        type: Sequelize.DATE,
        allowNull: true
      },
      iceBreakingPrompt: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Add unique constraint for userId1 and userId2 combination
    await queryInterface.addConstraint('matches', {
      fields: ['userId1', 'userId2'],
      type: 'unique',
      name: 'unique_match'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('matches', ['userId1']);
    await queryInterface.addIndex('matches', ['userId2']);
    await queryInterface.addIndex('matches', ['isConnected']);
    await queryInterface.addIndex('matches', ['mutualAdjective']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('matches');
  }
}; 
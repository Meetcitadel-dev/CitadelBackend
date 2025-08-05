'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('adjective_selections', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
      adjective: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      isMatched: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    // Add unique constraint for userId and targetUserId combination
    await queryInterface.addConstraint('adjective_selections', {
      fields: ['userId', 'targetUserId'],
      type: 'unique',
      name: 'unique_adjective_selection'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('adjective_selections', ['userId']);
    await queryInterface.addIndex('adjective_selections', ['targetUserId']);
    await queryInterface.addIndex('adjective_selections', ['adjective']);
    await queryInterface.addIndex('adjective_selections', ['isMatched']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('adjective_selections');
  }
}; 
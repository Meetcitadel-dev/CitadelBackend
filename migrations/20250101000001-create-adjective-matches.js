'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('adjective_matches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      adjective: {
        type: Sequelize.STRING,
        allowNull: false
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      matched: {
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

    // Add unique constraint for userId1, userId2, and adjective combination
    await queryInterface.addConstraint('adjective_matches', {
      fields: ['userId1', 'userId2', 'adjective'],
      type: 'unique',
      name: 'unique_adjective_match'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('adjective_matches', ['userId1']);
    await queryInterface.addIndex('adjective_matches', ['userId2']);
    await queryInterface.addIndex('adjective_matches', ['adjective']);
    await queryInterface.addIndex('adjective_matches', ['matched']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('adjective_matches');
  }
}; 
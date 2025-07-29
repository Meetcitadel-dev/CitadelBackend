'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('connection_requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      requester_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      target_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
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

    // Add unique constraint for requester_id and target_id combination
    await queryInterface.addConstraint('connection_requests', {
      fields: ['requester_id', 'target_id'],
      type: 'unique',
      name: 'unique_connection_request'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('connection_requests', ['requester_id']);
    await queryInterface.addIndex('connection_requests', ['target_id']);
    await queryInterface.addIndex('connection_requests', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('connection_requests');
  }
};
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_read_status', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      notification_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      notification_type: {
        type: Sequelize.ENUM('connection_request', 'adjective_notification'),
        allowNull: false
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      read_at: {
        type: Sequelize.DATE,
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

    // Add unique constraint for user_id, notification_id, and notification_type combination
    await queryInterface.addConstraint('notification_read_status', {
      fields: ['user_id', 'notification_id', 'notification_type'],
      type: 'unique',
      name: 'unique_notification_read'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('notification_read_status', ['user_id']);
    await queryInterface.addIndex('notification_read_status', ['notification_type']);
    await queryInterface.addIndex('notification_read_status', ['is_read']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notification_read_status');
  }
};
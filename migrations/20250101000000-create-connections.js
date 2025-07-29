'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('connections', {
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
      status: {
        type: Sequelize.ENUM('requested', 'connected', 'blocked'),
        allowNull: false,
        defaultValue: 'requested'
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
    await queryInterface.addConstraint('connections', {
      fields: ['userId1', 'userId2'],
      type: 'unique',
      name: 'unique_user_connection'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('connections', ['userId1']);
    await queryInterface.addIndex('connections', ['userId2']);
    await queryInterface.addIndex('connections', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('connections');
  }
}; 
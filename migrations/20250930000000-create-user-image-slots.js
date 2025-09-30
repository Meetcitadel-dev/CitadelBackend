'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_image_slots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      slot: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      userImageId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'user_images', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assignedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
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

    await queryInterface.addConstraint('user_image_slots', {
      fields: ['userId', 'slot'],
      type: 'unique',
      name: 'user_image_slots_user_slot_unique'
    });

    await queryInterface.addIndex('user_image_slots', ['userId']);
    await queryInterface.addIndex('user_image_slots', ['userImageId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_image_slots');
  }
};



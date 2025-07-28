'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update cloudfrontUrl column to TEXT type to handle long URLs
    await queryInterface.changeColumn('user_images', 'cloudfrontUrl', {
      type: Sequelize.TEXT,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to VARCHAR(255)
    await queryInterface.changeColumn('user_images', 'cloudfrontUrl', {
      type: Sequelize.STRING(255),
      allowNull: false
    });
  }
}; 
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
    });

    // Add index for faster lookups
    await queryInterface.addIndex('users', ['username']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', ['username']);
    await queryInterface.removeColumn('users', 'username');
  }
}; 
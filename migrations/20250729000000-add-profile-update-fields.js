'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'about_me', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'sports', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'movies', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'tv_shows', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'teams', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'portfolio_link', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'phone_number', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'about_me');
    await queryInterface.removeColumn('users', 'sports');
    await queryInterface.removeColumn('users', 'movies');
    await queryInterface.removeColumn('users', 'tv_shows');
    await queryInterface.removeColumn('users', 'teams');
    await queryInterface.removeColumn('users', 'portfolio_link');
    await queryInterface.removeColumn('users', 'phone_number');
  }
}; 
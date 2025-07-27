'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'universityId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'degree', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'year', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'gender', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'dateOfBirth', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'skills', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'friends', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'isProfileComplete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'name');
    await queryInterface.removeColumn('users', 'universityId');
    await queryInterface.removeColumn('users', 'degree');
    await queryInterface.removeColumn('users', 'year');
    await queryInterface.removeColumn('users', 'gender');
    await queryInterface.removeColumn('users', 'dateOfBirth');
    await queryInterface.removeColumn('users', 'skills');
    await queryInterface.removeColumn('users', 'friends');
    await queryInterface.removeColumn('users', 'isProfileComplete');
  }
}; 
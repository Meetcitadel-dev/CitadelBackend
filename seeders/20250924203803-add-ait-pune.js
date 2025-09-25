'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('universities', [{
      name: 'Army Institute of Technology, Pune',
      domain: 'aitpune.edu.in',
      country: 'India',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('universities', { domain: 'aitpune.edu.in' });
  }
};

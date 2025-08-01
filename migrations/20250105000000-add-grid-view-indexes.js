'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add indexes for better performance in grid view
    await queryInterface.addIndex('users', ['isProfileComplete', 'gender'], {
      name: 'idx_users_active_gender'
    });

    await queryInterface.addIndex('users', ['isProfileComplete', 'year'], {
      name: 'idx_users_active_year'
    });

    await queryInterface.addIndex('users', ['name'], {
      name: 'idx_users_name_search'
    });

    // Add GIN index for skills array search
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_skills_gin 
      ON users USING GIN (skills)
    `);

    // Add index for university name search
    await queryInterface.addIndex('users', ['universityId'], {
      name: 'idx_users_university_id'
    });

    // Add index for connection status queries
    await queryInterface.addIndex('connections', ['userId1', 'status'], {
      name: 'idx_connections_user1_status'
    });

    await queryInterface.addIndex('connections', ['userId2', 'status'], {
      name: 'idx_connections_user2_status'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('users', 'idx_users_active_gender');
    await queryInterface.removeIndex('users', 'idx_users_active_year');
    await queryInterface.removeIndex('users', 'idx_users_name_search');
    await queryInterface.removeIndex('users', 'idx_users_university_id');
    await queryInterface.removeIndex('connections', 'idx_connections_user1_status');
    await queryInterface.removeIndex('connections', 'idx_connections_user2_status');
    
    // Remove GIN index
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_users_skills_gin
    `);
  }
}; 
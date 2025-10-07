'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add indexes for better university search performance
    
    // Basic index on name for exact matches and prefix searches
    await queryInterface.addIndex('universities', ['name'], {
      name: 'universities_name_idx'
    });

    // GIN index for full-text search (PostgreSQL specific)
    // This requires the pg_trgm extension
    try {
      await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
      await queryInterface.sequelize.query(`
        CREATE INDEX CONCURRENTLY universities_name_gin_idx 
        ON universities USING gin (name gin_trgm_ops);
      `);
    } catch (error) {
      console.warn('Could not create GIN index (pg_trgm extension may not be available):', error.message);
    }

    // Index on domain for email-based university detection
    await queryInterface.addIndex('universities', ['domain'], {
      name: 'universities_domain_idx'
    });

    // Index on country for filtering by country
    await queryInterface.addIndex('universities', ['country'], {
      name: 'universities_country_idx'
    });

    console.log('✅ University indexes created successfully');
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes in reverse order
    await queryInterface.removeIndex('universities', 'universities_country_idx');
    await queryInterface.removeIndex('universities', 'universities_domain_idx');
    
    try {
      await queryInterface.sequelize.query('DROP INDEX CONCURRENTLY IF EXISTS universities_name_gin_idx;');
    } catch (error) {
      console.warn('Could not drop GIN index:', error.message);
    }
    
    await queryInterface.removeIndex('universities', 'universities_name_idx');

    console.log('✅ University indexes removed successfully');
  }
};

import sequelize from '../config/db';
import '../models'; // Import all models

async function testDatabaseTables() {
  try {
    console.log('🔍 Testing database tables...');
    
    // Test if we can connect to the database
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test if the adjective_selections table exists
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('adjective_selections', 'matches', 'users')
    `);
    
    console.log('📋 Available tables:', results);
    
    // Test if we can query the adjective_selections table
    const [adjectiveResults] = await sequelize.query(`
      SELECT COUNT(*) as count FROM adjective_selections
    `);
    
    console.log('📊 Adjective selections count:', adjectiveResults);
    
    // Test if we can query the matches table
    const [matchResults] = await sequelize.query(`
      SELECT COUNT(*) as count FROM matches
    `);
    
    console.log('📊 Matches count:', matchResults);
    
    console.log('✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testDatabaseTables(); 
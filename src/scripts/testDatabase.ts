import sequelize from '../config/db';

const testDatabaseConnection = async () => {
  console.log('🔍 Testing Database Connection...\n');

  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await sequelize.query('SELECT 1 as test');
    console.log('✅ Database query successful:', result[0]);
    
  } catch (error: any) {
    console.log('❌ Database connection failed:', error.message);
    console.log('Error details:', error);
  } finally {
    await sequelize.close();
  }
};

testDatabaseConnection().catch(console.error); 
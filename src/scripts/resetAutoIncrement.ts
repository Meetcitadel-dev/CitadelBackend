import sequelize from '../config/db';

async function resetAutoIncrement() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Reset auto-increment for users table
    await sequelize.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    console.log('✅ Reset users auto-increment to 1');

    // Reset auto-increment for user_images table
    await sequelize.query('ALTER SEQUENCE user_images_id_seq RESTART WITH 1');
    console.log('✅ Reset user_images auto-increment to 1');

    console.log('✅ Auto-increment counters reset successfully!');

  } catch (error) {
    console.error('❌ Error resetting auto-increment:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
resetAutoIncrement(); 
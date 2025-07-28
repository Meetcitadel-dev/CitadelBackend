import sequelize from '../config/db';
import User from '../models/user.model';

async function deleteAllUsers() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Get count before deletion
    const userCount = await User.count();
    console.log(`📊 Found ${userCount} users in database`);

    if (userCount === 0) {
      console.log('ℹ️  No users to delete.');
      return;
    }

    // Delete all users
    const deletedCount = await User.destroy({
      where: {},
      truncate: false
    });

    console.log(`🗑️  Successfully deleted ${deletedCount} users from database`);
    console.log('✅ Users table is now empty');

  } catch (error) {
    console.error('❌ Error deleting users:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
deleteAllUsers(); 
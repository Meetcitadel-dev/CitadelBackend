import sequelize from '../config/db';

async function addUsernameField() {
  try {
    console.log('🔧 Checking if username field exists...');

    // Check if username column exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'username'
    `);

    if (results.length > 0) {
      console.log('✅ Username field already exists');
      return;
    }

    console.log('📝 Adding username field to users table...');

    // Add username column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN username VARCHAR(50) UNIQUE
    `);

    // Add index for faster lookups
    await sequelize.query(`
      CREATE INDEX idx_users_username ON users(username)
    `);

    console.log('✅ Username field added successfully!');
  } catch (error) {
    console.error('❌ Error adding username field:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script if called directly
if (require.main === module) {
  addUsernameField()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default addUsernameField; 
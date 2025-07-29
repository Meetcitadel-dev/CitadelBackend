import sequelize from '../config/db';
import '../models/user.model';
import '../models/university.model';
import '../models/userImage.model';
import '../models/connection.model';
import '../models/adjectiveMatch.model';

async function runMigrations() {
  try {
    console.log('Starting migrations...');
    
    // Sync all models with database
    await sequelize.sync({ alter: true });
    
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations(); 
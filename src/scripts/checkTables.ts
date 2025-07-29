import sequelize from '../config/db';
import ConnectionRequest from '../models/connectionRequest.model';
import NotificationReadStatus from '../models/notificationReadStatus.model';

async function checkAndCreateTables() {
  try {
    console.log('Checking and creating tables...');
    
    // Sync the models to create tables if they don't exist
    await ConnectionRequest.sync({ force: false });
    console.log('✅ ConnectionRequest table is ready');
    
    await NotificationReadStatus.sync({ force: false });
    console.log('✅ NotificationReadStatus table is ready');
    
    console.log('All tables are ready!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

checkAndCreateTables();
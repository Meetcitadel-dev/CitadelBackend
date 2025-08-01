import sequelize from '../config/db';
import { setupAssociations } from '../models/associations';
import User from '../models/user.model';

async function checkUser() {
  try {
    console.log('🔍 Checking User ID 30...');
    
    // Setup associations
    setupAssociations();
    
    // Check if user 30 exists
    const user = await User.findByPk(30);
    
    if (user) {
      console.log('✅ User 30 found:', {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username
      });
    } else {
      console.log('❌ User 30 not found');
      
      // List all users
      const allUsers = await User.findAll({
        attributes: ['id', 'name', 'email', 'username'],
        limit: 10
      });
      
      console.log('📋 Available users:');
      allUsers.forEach(u => {
        console.log(`  ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkUser(); 
import sequelize from '../config/db';
import { setupAssociations } from '../models/associations';
import User from '../models/user.model';

async function createTestUser() {
  try {
    console.log('🔍 Creating Test User...');
    
    // Setup associations
    setupAssociations();
    
    // Check if user 30 already exists
    const existingUser = await User.findByPk(30);
    
    if (existingUser) {
      console.log('✅ User 30 already exists:', {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email
      });
      return;
    }
    
    // Create test user with ID 30
    const testUser = await User.create({
      id: 30,
      email: 'nisarg.patel@mastersunion.org',
      name: 'Nisarg Patel',
      username: 'nisarg.patel',
      isEmailVerified: true,
      isProfileComplete: true,
      universityId: 1, // Assuming university ID 1 exists
      degree: 'Computer Science',
      year: 'Third',
      gender: 'male',
      skills: ['JavaScript', 'React', 'Node.js'],
      otpAttempts: 0
    });
    
    console.log('✅ Test user created:', {
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
      username: testUser.username
    });
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await sequelize.close();
  }
}

createTestUser(); 
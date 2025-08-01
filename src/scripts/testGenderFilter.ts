import User from '../models/user.model';
import University from '../models/university.model';
import { Op } from 'sequelize';

async function testGenderFilter() {
  try {
    console.log('🧪 Testing Gender Filter...');
    
    // Check all users and their genders
    console.log('\n📋 All users and their genders:');
    const allUsers = await User.findAll({
      where: {
        isProfileComplete: true
      },
      attributes: ['id', 'name', 'gender', 'year']
    });
    
    allUsers.forEach((user: any) => {
      console.log(`${user.id}. ${user.name} - Gender: "${user.gender}" - Year: ${user.year}`);
    });
    
    // Check unique gender values
    console.log('\n🔍 Unique gender values in database:');
    const uniqueGenders = await User.findAll({
      where: {
        gender: { [Op.ne]: null as any }
      },
      attributes: ['gender'],
      group: ['gender'],
      order: [['gender', 'ASC']]
    });
    
    uniqueGenders.forEach((gender: any) => {
      console.log(`- "${gender.gender}"`);
    });
    
    // Test female filter specifically
    console.log('\n👩 Testing female filter:');
    const femaleUsers = await User.findAll({
      where: {
        gender: 'female',
        isProfileComplete: true
      }
    });
    
    console.log(`Found ${femaleUsers.length} users with gender='female'`);
    femaleUsers.forEach((user: any) => {
      console.log(`- ${user.name} (${user.gender})`);
    });
    
    // Test case-insensitive search
    console.log('\n🔍 Testing case variations:');
    const femaleLower = await User.findAll({
      where: {
        gender: 'Female',
        isProfileComplete: true
      }
    });
    
    console.log(`Found ${femaleLower.length} users with gender='Female'`);
    
    const femaleUpper = await User.findAll({
      where: {
        gender: 'FEMALE',
        isProfileComplete: true
      }
    });
    
    console.log(`Found ${femaleUpper.length} users with gender='FEMALE'`);
    
  } catch (error) {
    console.error('❌ Error testing gender filter:', error);
  }
}

testGenderFilter(); 
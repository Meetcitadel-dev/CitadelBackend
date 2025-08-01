import User from '../models/user.model';
import University from '../models/university.model';
import { Op } from 'sequelize';

// Year mapping from frontend to database values
const YEAR_MAPPING: { [key: string]: string } = {
  'First': '1st',
  'Second': '2nd', 
  'Third': '3rd',
  'Fourth': '4th',
  '1st': '1st',
  '2nd': '2nd',
  '3rd': '3rd',
  '4th': '4th'
};

async function testYearsFilter() {
  try {
    console.log('🧪 Testing Years Filter...');
    
    // Test with "Second" (frontend value)
    const yearsFilter = 'Second';
    const mappedYears = [yearsFilter].map(year => YEAR_MAPPING[year] || year);
    
    console.log(`Frontend year: ${yearsFilter}`);
    console.log(`Mapped to database: ${mappedYears}`);
    
    // Query users with the mapped year
    const users = await User.findAll({
      where: {
        year: { [Op.in]: mappedYears },
        isProfileComplete: true
      },
      include: [{
        model: University,
        as: 'university'
      }],
      limit: 10
    });
    
    console.log(`\n📊 Results for year filter "${yearsFilter}":`);
    console.log(`Found ${users.length} users`);
    
    users.forEach((user: any, index: number) => {
      console.log(`${index + 1}. ${user.name} - ${user.year} year - ${user.university?.name}`);
    });
    
    // Also test with "2nd" directly
    console.log('\n🧪 Testing with "2nd" directly:');
    const usersDirect = await User.findAll({
      where: {
        year: '2nd',
        isProfileComplete: true
      },
      include: [{
        model: University,
        as: 'university'
      }],
      limit: 10
    });
    
    console.log(`Found ${usersDirect.length} users with "2nd" year`);
    
    // Show all available years in database
    console.log('\n📋 All available years in database:');
    const allYears = await User.findAll({
      where: {
        year: { [Op.ne]: null as any }
      },
      attributes: ['year'],
      group: ['year'],
      order: [['year', 'ASC']]
    });
    
    allYears.forEach((year: any) => {
      console.log(`- ${year.year}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing years filter:', error);
  }
}

testYearsFilter(); 
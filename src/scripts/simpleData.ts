import sequelize from '../config/db';
import User from '../models/user.model';
import University from '../models/university.model';
import UserImage from '../models/userImage.model';

async function getSimpleData() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Get all users (simple, no associations)
    const users = await User.findAll();
    console.log(`\n👥 USERS (${users.length} total):`);
    console.log('==========');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'Not set'}`);
      console.log(`   University ID: ${user.universityId || 'Not set'}`);
      console.log(`   Degree: ${user.degree || 'Not set'}`);
      console.log(`   Year: ${user.year || 'Not set'}`);
      console.log(`   Profile Complete: ${user.isProfileComplete}`);
      console.log(`   Email Verified: ${user.isEmailVerified}`);
      console.log('   ---');
    });

    // Get all universities (simple, no associations)
    const universities = await University.findAll();
    console.log(`\n🏫 UNIVERSITIES (${universities.length} total):`);
    console.log('================');
    universities.forEach((university, index) => {
      console.log(`${index + 1}. ID: ${university.id}`);
      console.log(`   Name: ${university.name}`);
      console.log(`   Domain: ${university.domain}`);
      console.log(`   Country: ${university.country}`);
      console.log('   ---');
    });

    // Get all user images (simple, no associations)
    const userImages = await UserImage.findAll();
    console.log(`\n🖼️  USER IMAGES (${userImages.length} total):`);
    console.log('==================');
    userImages.forEach((image, index) => {
      console.log(`${index + 1}. ID: ${image.id}`);
      console.log(`   User ID: ${image.userId}`);
      console.log(`   Original Name: ${image.originalName}`);
      console.log(`   File Size: ${image.fileSize} bytes`);
      console.log(`   MIME Type: ${image.mimeType}`);
      console.log(`   CloudFront URL: ${image.cloudfrontUrl}`);
      console.log('   ---');
    });

    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Universities: ${universities.length}`);
    console.log(`Total Images: ${userImages.length}`);

  } catch (error) {
    console.error('❌ Error fetching data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
getSimpleData(); 
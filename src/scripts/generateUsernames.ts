import User from '../models/user.model';
import { generateUsername } from '../controllers/userProfile.controller';

async function generateUsernamesForExistingUsers() {
  try {
    console.log('🔧 Generating usernames for existing users...');

    // Find all users without usernames
    const usersWithoutUsername = await User.findAll({
      where: {
        username: null as any
      }
    });

    console.log(`Found ${usersWithoutUsername.length} users without usernames`);

    for (const user of usersWithoutUsername) {
      if (user.name) {
        const username = await generateUsername(user.name);
        await user.update({ username });
        console.log(`Generated username "${username}" for user "${user.name}" (ID: ${user.id})`);
      } else {
        // Generate username from email if no name
        const emailUsername = user.email.split('@')[0];
        const username = await generateUsername(emailUsername);
        await user.update({ username });
        console.log(`Generated username "${username}" for user with email "${user.email}" (ID: ${user.id})`);
      }
    }

    console.log('✅ Username generation completed successfully!');
  } catch (error) {
    console.error('❌ Error generating usernames:', error);
  }
}

// Run the script if called directly
if (require.main === module) {
  generateUsernamesForExistingUsers()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default generateUsernamesForExistingUsers; 
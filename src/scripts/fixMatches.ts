import sequelize from '../config/db';
import { Op } from 'sequelize';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import { setupAssociations } from '../models/associations';

async function fixMatches() {
  try {
    // Setup associations
    setupAssociations();

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    const userId = 15; // Ankit's ID

    // Update existing matches to be matched: true
    const updatedMatches = await AdjectiveMatch.update(
      { matched: true },
      {
        where: {
          [Op.or]: [
            { userId1: userId },
            { userId2: userId }
          ],
          matched: false
        }
      }
    );

    console.log(`✅ Updated ${updatedMatches[0]} matches to matched: true`);

    // Verify the update
    const matches = await AdjectiveMatch.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ],
        matched: true
      }
    });

    console.log(`✅ Now have ${matches.length} matched conversations`);

    console.log('\n✅ Matches fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing matches:', error);
  } finally {
    await sequelize.close();
  }
}

fixMatches(); 
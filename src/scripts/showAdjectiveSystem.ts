import dotenv from 'dotenv';
dotenv.config();
import User from '../models/user.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import { setupAssociations } from '../models/associations';
import { Op } from 'sequelize';

// Setup model associations
setupAssociations();

async function showAdjectiveSystem() {
  try {
    console.log('🎭 ADJECTIVE MATCHING SYSTEM EXPLANATION\n');

    // Get your profile
    const yourProfile = await User.findOne({
      where: { email: 'ankitranjan_21412@aitpune.edu.in' }
    });

    if (!yourProfile) {
      console.log('❌ Your profile not found');
      return;
    }

    console.log('👤 YOUR PROFILE:');
    console.log(`   Name: ${yourProfile.name} (ID: ${yourProfile.id})`);
    console.log(`   Email: ${yourProfile.email}\n`);

    // Show all existing adjective selections
    console.log('📊 CURRENT ADJECTIVE SELECTIONS IN DATABASE:\n');
    
    const allSelections = await AdjectiveMatch.findAll({
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['timestamp', 'DESC']]
    });

    if (allSelections.length === 0) {
      console.log('   No adjective selections found in database');
    } else {
      allSelections.forEach((selection, index) => {
        const user1Name = (selection as any).user1?.name || `User ${selection.userId1}`;
        const user2Name = (selection as any).user2?.name || `User ${selection.userId2}`;
        const matchStatus = selection.matched ? '✅ MATCHED' : '⏳ Pending';
        
        console.log(`${index + 1}. ${user1Name} → ${user2Name}: "${selection.adjective}" ${matchStatus}`);
        console.log(`   Timestamp: ${selection.timestamp}`);
        console.log(`   Record ID: ${selection.id}\n`);
      });
    }

    // Show your specific selections
    console.log('🎯 YOUR ADJECTIVE SELECTIONS:\n');
    
    const yourSelections = await AdjectiveMatch.findAll({
      where: { userId1: yourProfile.id },
      include: [
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['timestamp', 'DESC']]
    });

    if (yourSelections.length === 0) {
      console.log('   You haven\'t selected any adjectives yet');
    } else {
      yourSelections.forEach((selection, index) => {
        const targetName = (selection as any).user2?.name || `User ${selection.userId2}`;
        const matchStatus = selection.matched ? '✅ MATCHED' : '⏳ Pending';
        
        console.log(`${index + 1}. You selected "${selection.adjective}" for ${targetName} ${matchStatus}`);
      });
    }

    // Show selections made for you
    console.log('\n👥 ADJECTIVES SELECTED FOR YOU:\n');
    
    const selectionsForYou = await AdjectiveMatch.findAll({
      where: { userId2: yourProfile.id },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['timestamp', 'DESC']]
    });

    if (selectionsForYou.length === 0) {
      console.log('   No one has selected adjectives for you yet');
    } else {
      selectionsForYou.forEach((selection, index) => {
        const selectorName = (selection as any).user1?.name || `User ${selection.userId1}`;
        const matchStatus = selection.matched ? '✅ MATCHED' : '⏳ Pending';
        
        console.log(`${index + 1}. ${selectorName} selected "${selection.adjective}" for you ${matchStatus}`);
      });
    }

    // Show mutual matches
    console.log('\n🎉 MUTUAL MATCHES:\n');
    
    const mutualMatches = await AdjectiveMatch.findAll({
      where: { matched: true },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['timestamp', 'DESC']]
    });

    if (mutualMatches.length === 0) {
      console.log('   No mutual matches found yet');
    } else {
      mutualMatches.forEach((match, index) => {
        const user1Name = (match as any).user1?.name || `User ${match.userId1}`;
        const user2Name = (match as any).user2?.name || `User ${match.userId2}`;
        
        console.log(`${index + 1}. ${user1Name} ↔ ${user2Name}: "${match.adjective}"`);
        console.log(`   Matched at: ${match.timestamp}\n`);
      });
    }

    console.log('\n🎯 HOW THE SYSTEM WORKS:\n');
    console.log('1. 📱 User A sees User B\'s profile in explore screen');
    console.log('2. 🎨 User A selects an adjective (e.g., "Smart") for User B');
    console.log('3. 💾 Selection is saved to database with matched=false');
    console.log('4. 🔍 System checks if User B selected "Smart" for User A');
    console.log('5. 🎉 If yes → Both records updated to matched=true');
    console.log('6. 📱 Both users receive notifications of mutual interest');
    console.log('7. 💬 This creates a natural conversation starter');

    console.log('\n🌟 PURPOSE & BENEFITS:\n');
    console.log('• 🎯 Discover shared personality traits beyond academics');
    console.log('• 💬 Create natural conversation starters');
    console.log('• 🎉 Real-time mutual interest discovery');
    console.log('• 📱 Instant notifications when matches occur');
    console.log('• 🤝 Build meaningful connections');
    console.log('• 🚫 Prevent spam (unique constraint prevents duplicates)');

    console.log('\n📈 AVAILABLE ADJECTIVES:\n');
    const adjectives = [
      'Smart', 'Creative', 'Funny', 'Ambitious', 'Kind',
      'Adventurous', 'Reliable', 'Witty', 'Thoughtful', 'Bold',
      'Genuine', 'Energetic', 'Calm', 'Inspiring', 'Curious'
    ];
    
    adjectives.forEach((adj, index) => {
      console.log(`${index + 1}. ${adj}`);
    });

    console.log('\n🚀 READY TO TEST IN YOUR APP!');
    console.log('• Go to explore screen');
    console.log('• Select different adjectives for users');
    console.log('• Watch for mutual matches in real-time');
    console.log('• Try selecting adjectives that others might also choose');

  } catch (error) {
    console.error('Error showing adjective system:', error);
  } finally {
    process.exit(0);
  }
}

showAdjectiveSystem(); 
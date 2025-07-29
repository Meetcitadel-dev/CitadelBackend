import dotenv from 'dotenv';
dotenv.config();
import User from '../models/user.model';
import Interaction from '../models/interaction.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import Connection from '../models/connection.model';
import { setupAssociations } from '../models/associations';
import { Op } from 'sequelize';

// Setup model associations
setupAssociations();

async function testInteractionSystem() {
  try {
    console.log('🔍 TESTING INTERACTION TRACKING SYSTEM\n');

    // Get your profile
    const yourProfile = await User.findOne({
      where: { email: 'ankitranjan_21412@aitpune.edu.in' }
    });

    if (!yourProfile) {
      console.log('❌ Your profile not found');
      return;
    }

    console.log('👤 YOUR PROFILE:');
    console.log(`   Name: ${yourProfile.name} (ID: ${yourProfile.id})\n`);

    // Get all users for testing
    const allUsers = await User.findAll({
      where: {
        id: { [Op.ne]: yourProfile.id },
        isProfileComplete: true
      },
      limit: 5
    });

    console.log('👥 AVAILABLE USERS FOR TESTING:');
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (ID: ${user.id})`);
    });
    console.log('');

    // Test 1: Track profile views
    console.log('📊 TEST 1: Tracking profile views...');
    
    for (let i = 0; i < 3; i++) {
      const targetUser = allUsers[i];
      if (targetUser) {
        await Interaction.create({
          userId: yourProfile.id,
          targetUserId: targetUser.id,
          interactionType: 'viewed',
          timestamp: new Date()
        });
        console.log(`   ✅ Viewed ${targetUser.name}`);
      }
    }

    // Test 2: Track adjective selections
    console.log('\n🎨 TEST 2: Tracking adjective selections...');
    
    const targetUser = allUsers[0];
    if (targetUser) {
      await Interaction.create({
        userId: yourProfile.id,
        targetUserId: targetUser.id,
        interactionType: 'adjective_selected',
        timestamp: new Date()
      });
      console.log(`   ✅ Selected adjective for ${targetUser.name}`);
    }

    // Test 3: Track connection
    console.log('\n🔗 TEST 3: Tracking connection...');
    
    const connectionTarget = allUsers[1];
    if (connectionTarget) {
      await Interaction.create({
        userId: yourProfile.id,
        targetUserId: connectionTarget.id,
        interactionType: 'connected',
        timestamp: new Date()
      });
      console.log(`   ✅ Connected with ${connectionTarget.name}`);
    }

    // Test 4: Check all interactions
    console.log('\n📋 TEST 4: Checking all interactions...');
    
    const allInteractions = await Interaction.findAll({
      where: { userId: yourProfile.id },
      include: [
        {
          model: User,
          as: 'targetUser',
          attributes: ['id', 'name']
        }
      ],
      order: [['timestamp', 'DESC']]
    });

    console.log('   Your interactions:');
    allInteractions.forEach((interaction, index) => {
      const targetUser = (interaction as any).targetUser;
      console.log(`   ${index + 1}. ${interaction.interactionType} → ${targetUser?.name || `User ${interaction.targetUserId}`}`);
    });

    // Test 5: Check which users should be filtered out
    console.log('\n🚫 TEST 5: Checking filtered users...');
    
    const interactedUserIds = allInteractions.map(interaction => interaction.targetUserId);
    
    console.log('   Users you\'ve interacted with (should be filtered out):');
    interactedUserIds.forEach((userId, index) => {
      const user = allUsers.find(u => u.id === userId);
      console.log(`   ${index + 1}. ${user?.name || `User ${userId}`}`);
    });

    // Test 6: Simulate explore profiles (should exclude interacted users)
    console.log('\n🔍 TEST 6: Simulating explore profiles...');
    
    const availableUsers = allUsers.filter(user => !interactedUserIds.includes(user.id));
    
    console.log('   Available users for explore (not interacted with):');
    if (availableUsers.length === 0) {
      console.log('   ❌ No new users available - you\'ve interacted with all!');
    } else {
      availableUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (ID: ${user.id})`);
      });
    }

    console.log('\n🎉 INTERACTION SYSTEM TESTING COMPLETE!');
    console.log('\n💡 HOW IT WORKS:');
    console.log('• Profile views are tracked automatically');
    console.log('• Adjective selections prevent re-interaction');
    console.log('• Connections are tracked');
    console.log('• Previously interacted profiles are filtered out');
    console.log('• Only new/uninteracted profiles are shown');

    console.log('\n🚀 FRONTEND INTEGRATION:');
    console.log('• Call POST /api/v1/explore/track-view when profile is viewed');
    console.log('• Adjective selection will be blocked if already interacted');
    console.log('• Explore profiles will only show new users');

  } catch (error) {
    console.error('Error testing interaction system:', error);
  } finally {
    process.exit(0);
  }
}

testInteractionSystem();
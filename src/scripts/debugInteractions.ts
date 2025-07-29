import dotenv from 'dotenv';
dotenv.config();
import User from '../models/user.model';
import Interaction from '../models/interaction.model';
import Connection from '../models/connection.model';
import { setupAssociations } from '../models/associations';
import { Op } from 'sequelize';

// Setup model associations
setupAssociations();

async function debugInteractions() {
  try {
    console.log('🔍 DEBUGGING INTERACTION SYSTEM\n');

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

    // Check all interactions for your user
    const allInteractions = await Interaction.findAll({
      where: { userId: yourProfile.id },
      order: [['timestamp', 'DESC']]
    });

    console.log('📊 ALL YOUR INTERACTIONS:');
    if (allInteractions.length === 0) {
      console.log('   ❌ No interactions found - this is the problem!');
    } else {
      allInteractions.forEach((interaction, index) => {
        console.log(`   ${index + 1}. ${interaction.interactionType} → User ${interaction.targetUserId} at ${interaction.timestamp}`);
      });
    }

    // Check specific interaction with Isha Kapoor (ID: 24)
    console.log('\n🎯 SPECIFIC CHECK FOR ISHA KAPOOR (ID: 24):');
    
    const ishaInteractions = await Interaction.findAll({
      where: {
        userId: yourProfile.id,
        targetUserId: 24
      }
    });

    if (ishaInteractions.length === 0) {
      console.log('   ❌ No interactions found with Isha Kapoor');
      console.log('   💡 This means the track-view calls are not being saved!');
    } else {
      console.log('   ✅ Interactions found with Isha Kapoor:');
      ishaInteractions.forEach((interaction, index) => {
        console.log(`      ${index + 1}. ${interaction.interactionType} at ${interaction.timestamp}`);
      });
    }

    // Check connections with Isha Kapoor
    console.log('\n🔗 CONNECTION STATUS WITH ISHA KAPOOR:');
    const ishaConnection = await Connection.findOne({
      where: {
        [Op.or]: [
          { userId1: yourProfile.id, userId2: 24 },
          { userId1: 24, userId2: yourProfile.id }
        ]
      }
    });

    if (ishaConnection) {
      console.log(`   ✅ Connection found: ${ishaConnection.status}`);
      console.log(`   📅 Created: ${ishaConnection.createdAt}`);
    } else {
      console.log('   ❌ No connection found');
    }

    // Simulate the explore profiles query
    console.log('\n🔍 SIMULATING EXPLORE PROFILES QUERY:');
    
    // Get blocked users
    const blockedConnections = await Connection.findAll({
      where: {
        [Op.or]: [
          { userId1: yourProfile.id, status: 'blocked' },
          { userId2: yourProfile.id, status: 'blocked' }
        ]
      }
    });

    const blockedUserIds = blockedConnections.map(conn => 
      conn.userId1 === yourProfile.id ? conn.userId2 : conn.userId1
    );

    console.log('   Blocked user IDs:', blockedUserIds);

    // Get interacted users
    const previousInteractions = await Interaction.findAll({
      where: {
        userId: yourProfile.id,
        interactionType: {
          [Op.in]: ['viewed', 'connected', 'adjective_selected', 'blocked']
        }
      },
      attributes: ['targetUserId']
    });

    const interactedUserIds = previousInteractions.map(interaction => interaction.targetUserId);
    console.log('   Interacted user IDs:', interactedUserIds);

    // Check if Isha Kapoor should be filtered
    const shouldFilterIsha = interactedUserIds.includes(24);
    console.log(`   Should Isha Kapoor (ID: 24) be filtered? ${shouldFilterIsha ? 'YES' : 'NO'}`);

    // Get all available users
    const allUsers = await User.findAll({
      where: {
        id: {
          [Op.ne]: yourProfile.id,
          [Op.notIn]: [...blockedUserIds, ...interactedUserIds]
        },
        isProfileComplete: true
      },
      attributes: ['id', 'name', 'email']
    });

    console.log('\n👥 AVAILABLE USERS (after filtering):');
    if (allUsers.length === 0) {
      console.log('   ❌ No users available after filtering');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (ID: ${user.id})`);
      });
    }

    console.log('\n💡 DIAGNOSIS:');
    if (allInteractions.length === 0) {
      console.log('❌ PROBLEM: No interactions are being saved!');
      console.log('   This means the track-view endpoint is not working properly.');
    } else if (!shouldFilterIsha) {
      console.log('❌ PROBLEM: Isha Kapoor should be filtered but isn\'t!');
      console.log('   The interaction filtering logic is not working.');
    } else {
      console.log('✅ Everything looks correct!');
    }

  } catch (error) {
    console.error('Error debugging interactions:', error);
  } finally {
    process.exit(0);
  }
}

debugInteractions();
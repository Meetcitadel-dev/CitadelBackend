import User from './user.model';
import University from './university.model';
import UserImage from './userImage.model';
import Connection from './connection.model';
import AdjectiveMatch from './adjectiveMatch.model';
import AdjectiveSelection from './adjectiveSelection.model';
import Match from './match.model';
import Interaction from './interaction.model';
import ConnectionRequest from './connectionRequest.model';
import NotificationReadStatus from './notificationReadStatus.model';
import Conversation from './conversation.model';
import Message from './message.model';
import UserOnlineStatus from './userOnlineStatus.model';

// Define all model associations
export function setupAssociations() {
  // User-University associations
  User.belongsTo(University, { foreignKey: 'universityId', as: 'userUniversity' });
  University.hasMany(User, { foreignKey: 'universityId', as: 'universityUsers' });

  // User-UserImage associations
  User.hasMany(UserImage, { foreignKey: 'userId', as: 'images' });
  UserImage.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

  // Connection associations
  Connection.belongsTo(User, { foreignKey: 'userId1', as: 'connectionUser1' });
  Connection.belongsTo(User, { foreignKey: 'userId2', as: 'connectionUser2' });

  // AdjectiveMatch associations
  AdjectiveMatch.belongsTo(User, { foreignKey: 'userId1', as: 'adjectiveMatchUser1' });
  AdjectiveMatch.belongsTo(User, { foreignKey: 'userId2', as: 'adjectiveMatchUser2' });

  // AdjectiveSelection associations
  AdjectiveSelection.belongsTo(User, { foreignKey: 'userId', as: 'adjectiveSelectionUser' });
  AdjectiveSelection.belongsTo(User, { foreignKey: 'targetUserId', as: 'adjectiveSelectionTargetUser' });
  User.hasMany(AdjectiveSelection, { foreignKey: 'userId', as: 'adjectiveSelections' });
  User.hasMany(AdjectiveSelection, { foreignKey: 'targetUserId', as: 'adjectiveSelectionsReceived' });

  // Match associations
  Match.belongsTo(User, { foreignKey: 'userId1', as: 'matchUser1' });
  Match.belongsTo(User, { foreignKey: 'userId2', as: 'matchUser2' });
  User.hasMany(Match, { foreignKey: 'userId1', as: 'matchesAsUser1' });
  User.hasMany(Match, { foreignKey: 'userId2', as: 'matchesAsUser2' });

  // Interaction associations
  Interaction.belongsTo(User, { foreignKey: 'userId', as: 'interactionUser' });
  Interaction.belongsTo(User, { foreignKey: 'targetUserId', as: 'interactionTargetUser' });
  User.hasMany(Interaction, { foreignKey: 'userId', as: 'interactions' });
  User.hasMany(Interaction, { foreignKey: 'targetUserId', as: 'interactionsReceived' });

  // ConnectionRequest associations
  ConnectionRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
  ConnectionRequest.belongsTo(User, { foreignKey: 'targetId', as: 'target' });
  User.hasMany(ConnectionRequest, { foreignKey: 'requesterId', as: 'sentRequests' });
  User.hasMany(ConnectionRequest, { foreignKey: 'targetId', as: 'receivedRequests' });

  // NotificationReadStatus associations
  NotificationReadStatus.belongsTo(User, { foreignKey: 'userId', as: 'notificationUser' });
  User.hasMany(NotificationReadStatus, { foreignKey: 'userId', as: 'notificationReadStatuses' });

  // Chat system associations
  Conversation.belongsTo(User, { foreignKey: 'user1Id', as: 'conversationUser1' });
  Conversation.belongsTo(User, { foreignKey: 'user2Id', as: 'conversationUser2' });
  User.hasMany(Conversation, { foreignKey: 'user1Id', as: 'conversationsAsUser1' });
  User.hasMany(Conversation, { foreignKey: 'user2Id', as: 'conversationsAsUser2' });

  Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
  Message.belongsTo(User, { foreignKey: 'senderId', as: 'messageSender' });
  Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
  User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });

  UserOnlineStatus.belongsTo(User, { foreignKey: 'userId', as: 'onlineStatusUser' });
  User.hasOne(UserOnlineStatus, { foreignKey: 'userId', as: 'onlineStatus' });
} 
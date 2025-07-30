import User from './user.model';
import University from './university.model';
import UserImage from './userImage.model';
import Connection from './connection.model';
import AdjectiveMatch from './adjectiveMatch.model';
import Interaction from './interaction.model';
import ConnectionRequest from './connectionRequest.model';
import NotificationReadStatus from './notificationReadStatus.model';
import Conversation from './conversation.model';
import Message from './message.model';
import UserOnlineStatus from './userOnlineStatus.model';

// Define all model associations
export function setupAssociations() {
  // User-University associations
  User.belongsTo(University, { foreignKey: 'universityId', as: 'university' });
  University.hasMany(User, { foreignKey: 'universityId', as: 'users' });

  // User-UserImage associations
  User.hasMany(UserImage, { foreignKey: 'userId', as: 'images' });
  UserImage.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

  // Connection associations
  Connection.belongsTo(User, { foreignKey: 'userId1', as: 'user1' });
  Connection.belongsTo(User, { foreignKey: 'userId2', as: 'user2' });

  // AdjectiveMatch associations
  AdjectiveMatch.belongsTo(User, { foreignKey: 'userId1', as: 'user1' });
  AdjectiveMatch.belongsTo(User, { foreignKey: 'userId2', as: 'user2' });

  // Interaction associations
  Interaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Interaction.belongsTo(User, { foreignKey: 'targetUserId', as: 'targetUser' });
  User.hasMany(Interaction, { foreignKey: 'userId', as: 'interactions' });
  User.hasMany(Interaction, { foreignKey: 'targetUserId', as: 'interactionsReceived' });

  // ConnectionRequest associations
  ConnectionRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
  ConnectionRequest.belongsTo(User, { foreignKey: 'targetId', as: 'target' });
  User.hasMany(ConnectionRequest, { foreignKey: 'requesterId', as: 'sentRequests' });
  User.hasMany(ConnectionRequest, { foreignKey: 'targetId', as: 'receivedRequests' });

  // NotificationReadStatus associations
  NotificationReadStatus.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(NotificationReadStatus, { foreignKey: 'userId', as: 'notificationReadStatuses' });

  // Chat system associations
  Conversation.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' });
  Conversation.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' });
  User.hasMany(Conversation, { foreignKey: 'user1Id', as: 'conversationsAsUser1' });
  User.hasMany(Conversation, { foreignKey: 'user2Id', as: 'conversationsAsUser2' });

  Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
  Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
  Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
  User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });

  UserOnlineStatus.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasOne(UserOnlineStatus, { foreignKey: 'userId', as: 'onlineStatus' });
} 
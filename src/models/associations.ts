import User from './user.model';
import University from './university.model';
import UserImage from './userImage.model';
import Connection from './connection.model';
import AdjectiveMatch from './adjectiveMatch.model';
import AdjectiveSelection from './adjectiveSelection.model';
import AdjectiveSession from './adjectiveSession.model';
import Match from './match.model';
import Interaction from './interaction.model';
import ConnectionRequest from './connectionRequest.model';
import NotificationReadStatus from './notificationReadStatus.model';
import Conversation from './conversation.model';
import Message from './message.model';
import UserOnlineStatus from './userOnlineStatus.model';
import Group from './group.model';
import GroupMember from './groupMember.model';
import GroupMessage from './groupMessage.model';
import GroupMessageRead from './groupMessageRead.model';
import UserUnreadCount from './userUnreadCount.model';

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

  // AdjectiveSession associations
  AdjectiveSession.belongsTo(User, { foreignKey: 'userId', as: 'adjectiveSessionUser' });
  AdjectiveSession.belongsTo(User, { foreignKey: 'targetUserId', as: 'adjectiveSessionTargetUser' });
  User.hasMany(AdjectiveSession, { foreignKey: 'userId', as: 'adjectiveSessions' });
  User.hasMany(AdjectiveSession, { foreignKey: 'targetUserId', as: 'adjectiveSessionsReceived' });

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

  // Group chat associations
  Group.belongsTo(User, { foreignKey: 'createdBy', as: 'groupCreator' });
  User.hasMany(Group, { foreignKey: 'createdBy', as: 'createdGroups' });

  GroupMember.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });
  GroupMember.belongsTo(User, { foreignKey: 'userId', as: 'member' });
  Group.hasMany(GroupMember, { foreignKey: 'groupId', as: 'members' });
  User.hasMany(GroupMember, { foreignKey: 'userId', as: 'groupMemberships' });

  GroupMessage.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });
  GroupMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
  Group.hasMany(GroupMessage, { foreignKey: 'groupId', as: 'messages' });
  User.hasMany(GroupMessage, { foreignKey: 'senderId', as: 'sentGroupMessages' });

  GroupMessageRead.belongsTo(GroupMessage, { foreignKey: 'messageId', as: 'message' });
  GroupMessageRead.belongsTo(User, { foreignKey: 'userId', as: 'reader' });
  GroupMessage.hasMany(GroupMessageRead, { foreignKey: 'messageId', as: 'readStatuses' });
  User.hasMany(GroupMessageRead, { foreignKey: 'userId', as: 'groupMessageReads' });

  // UserUnreadCount associations
  UserUnreadCount.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(UserUnreadCount, { foreignKey: 'userId', as: 'unreadCounts' });
} 
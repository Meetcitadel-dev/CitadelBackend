"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAssociations = setupAssociations;
const user_model_1 = __importDefault(require("./user.model"));
const university_model_1 = __importDefault(require("./university.model"));
const userImage_model_1 = __importDefault(require("./userImage.model"));
const connection_model_1 = __importDefault(require("./connection.model"));
const adjectiveMatch_model_1 = __importDefault(require("./adjectiveMatch.model"));
const adjectiveSelection_model_1 = __importDefault(require("./adjectiveSelection.model"));
const adjectiveSession_model_1 = __importDefault(require("./adjectiveSession.model"));
const match_model_1 = __importDefault(require("./match.model"));
const interaction_model_1 = __importDefault(require("./interaction.model"));
const connectionRequest_model_1 = __importDefault(require("./connectionRequest.model"));
const notificationReadStatus_model_1 = __importDefault(require("./notificationReadStatus.model"));
const conversation_model_1 = __importDefault(require("./conversation.model"));
const message_model_1 = __importDefault(require("./message.model"));
const userOnlineStatus_model_1 = __importDefault(require("./userOnlineStatus.model"));
const group_model_1 = __importDefault(require("./group.model"));
const groupMember_model_1 = __importDefault(require("./groupMember.model"));
const groupMessage_model_1 = __importDefault(require("./groupMessage.model"));
const groupMessageRead_model_1 = __importDefault(require("./groupMessageRead.model"));
const userUnreadCount_model_1 = __importDefault(require("./userUnreadCount.model"));
// Define all model associations
function setupAssociations() {
    // User-University associations
    user_model_1.default.belongsTo(university_model_1.default, { foreignKey: 'universityId', as: 'userUniversity' });
    university_model_1.default.hasMany(user_model_1.default, { foreignKey: 'universityId', as: 'universityUsers' });
    // User-UserImage associations
    user_model_1.default.hasMany(userImage_model_1.default, { foreignKey: 'userId', as: 'images' });
    userImage_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId', as: 'owner' });
    // Connection associations
    connection_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId1', as: 'connectionUser1' });
    connection_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId2', as: 'connectionUser2' });
    // AdjectiveMatch associations
    adjectiveMatch_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId1', as: 'adjectiveMatchUser1' });
    adjectiveMatch_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId2', as: 'adjectiveMatchUser2' });
    // AdjectiveSelection associations
    adjectiveSelection_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId', as: 'adjectiveSelectionUser' });
    adjectiveSelection_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'targetUserId', as: 'adjectiveSelectionTargetUser' });
    user_model_1.default.hasMany(adjectiveSelection_model_1.default, { foreignKey: 'userId', as: 'adjectiveSelections' });
    user_model_1.default.hasMany(adjectiveSelection_model_1.default, { foreignKey: 'targetUserId', as: 'adjectiveSelectionsReceived' });
    // AdjectiveSession associations
    adjectiveSession_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId', as: 'adjectiveSessionUser' });
    adjectiveSession_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'targetUserId', as: 'adjectiveSessionTargetUser' });
    user_model_1.default.hasMany(adjectiveSession_model_1.default, { foreignKey: 'userId', as: 'adjectiveSessions' });
    user_model_1.default.hasMany(adjectiveSession_model_1.default, { foreignKey: 'targetUserId', as: 'adjectiveSessionsReceived' });
    // Match associations
    match_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId1', as: 'matchUser1' });
    match_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId2', as: 'matchUser2' });
    user_model_1.default.hasMany(match_model_1.default, { foreignKey: 'userId1', as: 'matchesAsUser1' });
    user_model_1.default.hasMany(match_model_1.default, { foreignKey: 'userId2', as: 'matchesAsUser2' });
    // Interaction associations
    interaction_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId', as: 'interactionUser' });
    interaction_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'targetUserId', as: 'interactionTargetUser' });
    user_model_1.default.hasMany(interaction_model_1.default, { foreignKey: 'userId', as: 'interactions' });
    user_model_1.default.hasMany(interaction_model_1.default, { foreignKey: 'targetUserId', as: 'interactionsReceived' });
    // ConnectionRequest associations
    connectionRequest_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'requesterId', as: 'requester' });
    connectionRequest_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'targetId', as: 'target' });
    user_model_1.default.hasMany(connectionRequest_model_1.default, { foreignKey: 'requesterId', as: 'sentRequests' });
    user_model_1.default.hasMany(connectionRequest_model_1.default, { foreignKey: 'targetId', as: 'receivedRequests' });
    // NotificationReadStatus associations
    notificationReadStatus_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId', as: 'notificationUser' });
    user_model_1.default.hasMany(notificationReadStatus_model_1.default, { foreignKey: 'userId', as: 'notificationReadStatuses' });
    // Chat system associations
    conversation_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'user1Id', as: 'conversationUser1' });
    conversation_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'user2Id', as: 'conversationUser2' });
    user_model_1.default.hasMany(conversation_model_1.default, { foreignKey: 'user1Id', as: 'conversationsAsUser1' });
    user_model_1.default.hasMany(conversation_model_1.default, { foreignKey: 'user2Id', as: 'conversationsAsUser2' });
    message_model_1.default.belongsTo(conversation_model_1.default, { foreignKey: 'conversationId', as: 'conversation' });
    message_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'senderId', as: 'messageSender' });
    conversation_model_1.default.hasMany(message_model_1.default, { foreignKey: 'conversationId', as: 'messages' });
    user_model_1.default.hasMany(message_model_1.default, { foreignKey: 'senderId', as: 'sentMessages' });
    userOnlineStatus_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId', as: 'onlineStatusUser' });
    user_model_1.default.hasOne(userOnlineStatus_model_1.default, { foreignKey: 'userId', as: 'onlineStatus' });
    // Group chat associations
    group_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'createdBy', as: 'groupCreator' });
    user_model_1.default.hasMany(group_model_1.default, { foreignKey: 'createdBy', as: 'createdGroups' });
    groupMember_model_1.default.belongsTo(group_model_1.default, { foreignKey: 'groupId', as: 'group' });
    groupMember_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId', as: 'member' });
    group_model_1.default.hasMany(groupMember_model_1.default, { foreignKey: 'groupId', as: 'members' });
    user_model_1.default.hasMany(groupMember_model_1.default, { foreignKey: 'userId', as: 'groupMemberships' });
    groupMessage_model_1.default.belongsTo(group_model_1.default, { foreignKey: 'groupId', as: 'group' });
    groupMessage_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'senderId', as: 'sender' });
    group_model_1.default.hasMany(groupMessage_model_1.default, { foreignKey: 'groupId', as: 'messages' });
    user_model_1.default.hasMany(groupMessage_model_1.default, { foreignKey: 'senderId', as: 'sentGroupMessages' });
    groupMessageRead_model_1.default.belongsTo(groupMessage_model_1.default, { foreignKey: 'messageId', as: 'message' });
    groupMessageRead_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId', as: 'reader' });
    groupMessage_model_1.default.hasMany(groupMessageRead_model_1.default, { foreignKey: 'messageId', as: 'readStatuses' });
    user_model_1.default.hasMany(groupMessageRead_model_1.default, { foreignKey: 'userId', as: 'groupMessageReads' });
    // UserUnreadCount associations
    userUnreadCount_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'userId', as: 'user' });
    user_model_1.default.hasMany(userUnreadCount_model_1.default, { foreignKey: 'userId', as: 'unreadCounts' });
}

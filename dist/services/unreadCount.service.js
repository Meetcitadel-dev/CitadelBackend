"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Removed Sequelize Op; using Mongoose filtering instead
const userUnreadCount_model_1 = __importDefault(require("../models/userUnreadCount.model"));
const groupMember_model_1 = __importDefault(require("../models/groupMember.model"));
const websocket_service_1 = __importDefault(require("./websocket.service"));
class UnreadCountService {
    /**
     * Increment unread count for a user in a specific chat
     */
    async incrementUnreadCount(userId, chatId, isGroup, messageId) {
        try {
            const unreadCount = await userUnreadCount_model_1.default.findOne({ userId, chatId, isGroup });
            let newCount = 1;
            if (unreadCount) {
                unreadCount.unreadCount += 1;
                if (messageId)
                    unreadCount.lastMessageId = messageId;
                await unreadCount.save();
                newCount = unreadCount.unreadCount;
            }
            else {
                await userUnreadCount_model_1.default.create({ userId, chatId, isGroup, unreadCount: 1, lastMessageId: messageId });
                newCount = 1;
            }
            // Emit real-time update to user's personal room
            websocket_service_1.default.emitToUser(userId, 'unread-count-update', {
                chatId,
                unreadCount: newCount,
                isGroup,
                lastMessageId: messageId
            });
            const latest = await userUnreadCount_model_1.default.findOne({ userId, chatId, isGroup });
            return latest?.unreadCount || 0;
        }
        catch (error) {
            console.error('Error incrementing unread count:', error);
            throw error;
        }
    }
    /**
     * Reset unread count for a user in a specific chat
     */
    async resetUnreadCount(userId, chatId, isGroup) {
        try {
            await userUnreadCount_model_1.default.updateOne({ userId, chatId, isGroup }, { $set: { unreadCount: 0 } });
            // Emit real-time update to user's personal room
            websocket_service_1.default.emitToUser(userId, 'unread-count-update', {
                chatId,
                unreadCount: 0,
                isGroup
            });
        }
        catch (error) {
            console.error('Error resetting unread count:', error);
            throw error;
        }
    }
    /**
     * Get unread count for a user in a specific chat
     */
    async getUnreadCount(userId, chatId, isGroup) {
        try {
            const unreadCount = await userUnreadCount_model_1.default.findOne({ userId, chatId, isGroup });
            return unreadCount?.unreadCount || 0;
        }
        catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }
    /**
     * Get all unread counts for a user
     */
    async getAllUnreadCounts(userId) {
        try {
            const unreadCounts = await userUnreadCount_model_1.default.find({ userId, unreadCount: { $gt: 0 } }).select('chatId isGroup unreadCount');
            return unreadCounts.map(uc => ({ chatId: uc.chatId, isGroup: uc.isGroup, unreadCount: uc.unreadCount }));
        }
        catch (error) {
            console.error('Error getting all unread counts:', error);
            return [];
        }
    }
    /**
     * Update unread counts for all group members when a new message is sent
     */
    async updateGroupUnreadCounts(groupId, senderId, messageId) {
        try {
            // Get all group members except the sender
            const groupMembers = await groupMember_model_1.default.find({ groupId, userId: { $ne: senderId } });
            // Update unread count for each member
            for (const member of groupMembers) {
                await this.incrementUnreadCount(member.userId, groupId, true, messageId);
            }
            console.log(`📊 [UNREAD] Updated unread counts for ${groupMembers.length} group members in group ${groupId}`);
        }
        catch (error) {
            console.error('Error updating group unread counts:', error);
            throw error;
        }
    }
    /**
     * Update unread count for direct chat when a new message is sent
     */
    async updateDirectChatUnreadCount(conversationId, senderId, recipientId, messageId) {
        try {
            await this.incrementUnreadCount(recipientId, conversationId, false, messageId);
            console.log(`📊 [UNREAD] Updated unread count for direct chat ${conversationId} for user ${recipientId}`);
        }
        catch (error) {
            console.error('Error updating direct chat unread count:', error);
            throw error;
        }
    }
}
exports.default = new UnreadCountService();

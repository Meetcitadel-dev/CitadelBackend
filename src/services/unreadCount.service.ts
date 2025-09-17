import { Op } from 'sequelize';
import UserUnreadCount from '../models/userUnreadCount.model';
import GroupMember from '../models/groupMember.model';
import websocketService from './websocket.service';

class UnreadCountService {
  /**
   * Increment unread count for a user in a specific chat
   */
  async incrementUnreadCount(userId: number, chatId: number, isGroup: boolean, messageId?: number | string): Promise<number> {
    try {
      const [unreadCount, created] = await UserUnreadCount.findOrCreate({
        where: {
          userId,
          chatId,
          isGroup
        },
        defaults: {
          userId,
          chatId,
          isGroup,
          unreadCount: 1,
          lastMessageId: messageId
        }
      });

      if (!created) {
        // Increment existing count
        await unreadCount.increment('unreadCount');
        if (messageId) {
          unreadCount.lastMessageId = messageId;
          await unreadCount.save();
        }
      }

      // Emit real-time update to user's personal room
      websocketService.emitToUser(userId, 'unread-count-update', {
        chatId,
        unreadCount: unreadCount.unreadCount + (created ? 0 : 1),
        isGroup,
        lastMessageId: messageId
      });

      return unreadCount.unreadCount + (created ? 0 : 1);
    } catch (error) {
      console.error('Error incrementing unread count:', error);
      throw error;
    }
  }

  /**
   * Reset unread count for a user in a specific chat
   */
  async resetUnreadCount(userId: number, chatId: number, isGroup: boolean): Promise<void> {
    try {
      await UserUnreadCount.update(
        { unreadCount: 0 },
        {
          where: {
            userId,
            chatId,
            isGroup
          }
        }
      );

      // Emit real-time update to user's personal room
      websocketService.emitToUser(userId, 'unread-count-update', {
        chatId,
        unreadCount: 0,
        isGroup
      });
    } catch (error) {
      console.error('Error resetting unread count:', error);
      throw error;
    }
  }

  /**
   * Get unread count for a user in a specific chat
   */
  async getUnreadCount(userId: number, chatId: number, isGroup: boolean): Promise<number> {
    try {
      const unreadCount = await UserUnreadCount.findOne({
        where: {
          userId,
          chatId,
          isGroup
        }
      });

      return unreadCount?.unreadCount || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Get all unread counts for a user
   */
  async getAllUnreadCounts(userId: number): Promise<Array<{ chatId: number; isGroup: boolean; unreadCount: number }>> {
    try {
      const unreadCounts = await UserUnreadCount.findAll({
        where: {
          userId,
          unreadCount: { [Op.gt]: 0 }
        },
        attributes: ['chatId', 'isGroup', 'unreadCount']
      });

      return unreadCounts.map(uc => ({
        chatId: uc.chatId,
        isGroup: uc.isGroup,
        unreadCount: uc.unreadCount
      }));
    } catch (error) {
      console.error('Error getting all unread counts:', error);
      return [];
    }
  }

  /**
   * Update unread counts for all group members when a new message is sent
   */
  async updateGroupUnreadCounts(groupId: number, senderId: number, messageId: number | string): Promise<void> {
    try {
      // Get all group members except the sender
      const groupMembers = await GroupMember.findAll({
        where: {
          groupId,
          userId: { [Op.ne]: senderId }
        }
      });

      // Update unread count for each member
      for (const member of groupMembers) {
        await this.incrementUnreadCount(member.userId, groupId, true, messageId);
      }

      console.log(`📊 [UNREAD] Updated unread counts for ${groupMembers.length} group members in group ${groupId}`);
    } catch (error) {
      console.error('Error updating group unread counts:', error);
      throw error;
    }
  }

  /**
   * Update unread count for direct chat when a new message is sent
   */
  async updateDirectChatUnreadCount(conversationId: number, senderId: number, recipientId: number, messageId: number | string): Promise<void> {
    try {
      await this.incrementUnreadCount(recipientId, conversationId, false, messageId);
      console.log(`📊 [UNREAD] Updated unread count for direct chat ${conversationId} for user ${recipientId}`);
    } catch (error) {
      console.error('Error updating direct chat unread count:', error);
      throw error;
    }
  }
}

export default new UnreadCountService();

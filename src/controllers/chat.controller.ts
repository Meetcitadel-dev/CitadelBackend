import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/user.model';
import Connection from '../models/connection.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import Match from '../models/match.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import UserOnlineStatus from '../models/userOnlineStatus.model';
import websocketService from '../services/websocket.service';
import UserImage from '../models/userImage.model';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

class ChatController {
  // Get active conversations (connected users)
  async getActiveConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      console.log('🔍 [ACTIVE] Looking for active conversations for user ID:', userId);

      // Get all connected users
      const connections = await Connection.findAll({
        where: {
          [Op.or]: [
            { userId1: userId },
            { userId2: userId }
          ],
          status: 'connected'
        },
        include: [
          {
            model: User,
            as: 'connectionUser1',
            attributes: ['id', 'name', 'username']
          },
          {
            model: User,
            as: 'connectionUser2',
            attributes: ['id', 'name', 'username']
          }
        ]
      });

      console.log('🔗 [ACTIVE] Found connections:', connections.length);

      const conversations = await Promise.all(
        connections.map(async (connection: any) => {
          // Fix: Get the OTHER user, not the same user
          const otherUser = connection.userId1 === userId ? connection.connectionUser2 : connection.connectionUser1;
          console.log(`👤 [ACTIVE] Other user: ${otherUser.name} (ID: ${otherUser.id})`);
          
          const conversation = await Conversation.findOne({
            where: {
              [Op.or]: [
                { user1Id: userId, user2Id: otherUser.id },
                { user1Id: otherUser.id, user2Id: userId }
              ]
            }
          });

          console.log(`💬 [ACTIVE] Conversation found:`, conversation ? conversation.id : 'NOT FOUND');

          // Get last message (simplified)
          let lastMessage = null;
          let lastMessageTime = null;
          if (conversation) {
            const lastMsg = await Message.findOne({
              where: { conversationId: conversation.id },
              order: [['createdAt', 'DESC']]
            });
            if (lastMsg) {
              lastMessage = lastMsg.text;
              lastMessageTime = lastMsg.createdAt;
            }
          }

          // Get unread count (simplified)
          let unreadCount = 0;
          if (conversation) {
            unreadCount = await Message.count({
              where: {
                conversationId: conversation.id,
                senderId: otherUser.id,
                status: { [Op.ne]: 'read' }
              }
            });
          }

          return {
            id: conversation?.id || null,
            userId: otherUser.id,
            name: otherUser.name || otherUser.username || 'Unknown User',
            profileImage: null,
            lastMessage,
            lastMessageTime,
            isOnline: false, // Simplified for now
            unreadCount
          };
        })
      );

      const filteredConversations = conversations.filter((conv: any) => conv.id !== null);
      console.log('✅ [ACTIVE] Returning filtered conversations:', filteredConversations.length);

      res.json({
        success: true,
        conversations: filteredConversations
      });
    } catch (error) {
      console.error('❌ [ACTIVE] Error fetching active conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active conversations'
      });
    }
  }

  // Get matched conversations (matched users)
  async getMatchedConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      console.log('🔍 [MATCHES] Looking for matched conversations for user ID:', userId);

      // Get all matched users using the new Match model
      const matches = await Match.findAll({
        where: {
          [Op.or]: [
            { userId1: userId },
            { userId2: userId }
          ]
        },
        include: [
          {
            model: User,
            as: 'matchUser1',
            attributes: ['id', 'name', 'username']
          },
          {
            model: User,
            as: 'matchUser2',
            attributes: ['id', 'name', 'username']
          }
        ]
      });

      console.log('💕 [MATCHES] Found matches:', matches.length);

      const conversations = await Promise.all(
        matches.map(async (match: any) => {
          // Fix: Get the OTHER user, not the same user
          const otherUser = match.userId1 === userId ? match.matchUser2 : match.matchUser1;
          console.log(`👤 [MATCHES] Other user: ${otherUser.name} (ID: ${otherUser.id})`);
          
          const conversation = await Conversation.findOne({
            where: {
              [Op.or]: [
                { user1Id: userId, user2Id: otherUser.id },
                { user1Id: otherUser.id, user2Id: userId }
              ]
            }
          });

          console.log(`💬 [MATCHES] Conversation found:`, conversation ? conversation.id : 'NOT FOUND');

          // Get last message (simplified)
          let lastMessage = null;
          let lastMessageTime = null;
          if (conversation) {
            const lastMsg = await Message.findOne({
              where: { conversationId: conversation.id },
              order: [['createdAt', 'DESC']]
            });
            if (lastMsg) {
              lastMessage = lastMsg.text;
              lastMessageTime = lastMsg.createdAt;
            }
          }

          // Get unread count (simplified)
          let unreadCount = 0;
          if (conversation) {
            unreadCount = await Message.count({
              where: {
                conversationId: conversation.id,
                senderId: otherUser.id,
                status: { [Op.ne]: 'read' }
              }
            });
          }

          return {
            id: conversation?.id || null,
            userId: otherUser.id,
            name: otherUser.name || otherUser.username || 'Unknown User',
            profileImage: null,
            lastMessage,
            lastMessageTime,
            isOnline: false, // Simplified for now
            unreadCount
          };
        })
      );

      const filteredConversations = conversations.filter((conv: any) => conv.id !== null);
      console.log('✅ [MATCHES] Returning filtered conversations:', filteredConversations.length);

      res.json({
        success: true,
        conversations: filteredConversations
      });
    } catch (error) {
      console.error('❌ [MATCHES] Error fetching matched conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch matched conversations'
      });
    }
  }

  // Get conversation messages
  async getConversationMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      // Verify user has access to this conversation
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      const messages = await Message.findAll({
        where: { conversationId },
        order: [['createdAt', 'ASC']],
        include: [
          {
            model: User,
            as: 'messageSender',
            attributes: ['id', 'name', 'username']
          }
        ]
      });

      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        isSent: msg.senderId === userId,
        timestamp: msg.createdAt,
        status: msg.status,
        sender: {
          id: msg.messageSender?.id,
          name: msg.messageSender?.name || msg.messageSender?.username || 'Unknown User'
        }
      }));

      res.json({
        success: true,
        messages: formattedMessages
      });
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation messages'
      });
    }
  }

  // Send message
  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;
      const { message } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Message too long (max 1000 characters)'
        });
      }

      // Verify user has access to this conversation
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Create the message in database
      const newMessage = await Message.create({
        conversationId,
        senderId: userId,
        text: message.trim(),
        status: 'sent'
      });

      // Update conversation updatedAt
      await conversation.update({ updatedAt: new Date() });

      // Get the other user in the conversation
      const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;

      // Emit real-time message to recipient if online
      console.log(`📡 Chat Controller - Checking if user ${otherUserId} is online...`);
      if (websocketService.isUserOnline(otherUserId)) {
        console.log(`✅ Chat Controller - User ${otherUserId} is online, emitting new_message`);
        websocketService.emitToUser(otherUserId, 'new_message', {
          conversationId,
          message: {
            id: newMessage.id,
            text: newMessage.text,
            senderId: newMessage.senderId,
            timestamp: newMessage.createdAt,
            status: newMessage.status
          }
        });
      } else {
        console.log(`❌ Chat Controller - User ${otherUserId} is not online`);
      }

      // Emit confirmation to sender
      if (websocketService.isUserOnline(userId)) {
        websocketService.emitToUser(userId, 'message_sent', {
          messageId: newMessage.id,
          conversationId,
          message: newMessage.text,
          timestamp: newMessage.createdAt,
          status: newMessage.status
        });
      }

      res.json({
        success: true,
        message: {
          id: newMessage.id,
          text: newMessage.text,
          timestamp: newMessage.createdAt,
          status: newMessage.status
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  }

  // Mark messages as read
  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      // Verify user has access to this conversation
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Mark all messages from other user as read
      const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
      
      await Message.update(
        { status: 'read' },
        {
          where: {
            conversationId,
            senderId: otherUserId,
            status: { [Op.ne]: 'read' }
          }
        }
      );

      // Notify sender that messages were read (real-time)
      if (websocketService.isUserOnline(otherUserId)) {
        websocketService.emitToUser(otherUserId, 'messages_read', {
          conversationId,
          readBy: userId
        });
      }

      res.json({
        success: true
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark messages as read'
      });
    }
  }

  // Get or create conversation by user ID
  async getConversationByUserId(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { targetUserId } = req.params;

      if (!targetUserId || isNaN(Number(targetUserId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid user ID is required'
        });
      }

      const targetUser = await User.findByPk(targetUserId, {
        attributes: ['id', 'name', 'username']
      });

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { user1Id: userId, user2Id: targetUserId },
            { user1Id: targetUserId, user2Id: userId }
          ]
        }
      });

      // If conversation doesn't exist, create it
      if (!conversation) {
        conversation = await Conversation.create({
          user1Id: Math.min(userId, Number(targetUserId)),
          user2Id: Math.max(userId, Number(targetUserId))
        });
      }

      res.json({
        success: true,
        conversation: {
          id: conversation.id,
          userId: targetUser.id,
          name: targetUser.name || targetUser.username || 'Unknown User',
          profileImage: null // TODO: Add profile image support
        }
      });
    } catch (error) {
      console.error('Error getting conversation by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversation'
      });
    }
  }

  // Get conversation details by conversation ID
  async getConversationDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          message: 'Conversation ID is required'
        });
      }

      // Find the conversation and verify user has access
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Get the other user's ID
      const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;

      // Get the other user's details
      const otherUser = await User.findByPk(otherUserId, {
        attributes: ['id', 'name', 'username'],
        include: [
          {
            model: UserImage,
            as: 'images',
            attributes: ['cloudfrontUrl'],
            required: false
          }
        ]
      });

      if (!otherUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        conversation: {
          id: conversation.id,
          userId: otherUser.id,
          name: otherUser.name || otherUser.username || 'Unknown User',
          profileImage: (otherUser as any).images?.[0]?.cloudfrontUrl || null
        }
      });
    } catch (error) {
      console.error('Error getting conversation details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversation details'
      });
    }
  }
}

export default new ChatController(); 
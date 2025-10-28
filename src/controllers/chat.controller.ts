import { Request, Response } from 'express';
import User from '../models/user.model';
import Connection from '../models/connection.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import Match from '../models/match.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import UserOnlineStatus from '../models/userOnlineStatus.model';
import Group from '../models/group.model';
import GroupMember from '../models/groupMember.model';
import GroupMessage from '../models/groupMessage.model';
import GroupMessageRead from '../models/groupMessageRead.model';
import websocketService from '../services/websocket.service';
import unreadCountService from '../services/unreadCount.service';
import UserImage from '../models/userImage.model';
import UserImageSlot from '../models/userImageSlot.model';
import { generateCloudFrontSignedUrl, generateS3SignedUrl } from '../services/s3.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

// Resolve user's primary (slot 0) profile image URL with UploadThing/CloudFront/S3 logic
async function getSlot0ImageUrl(userId: number): Promise<string | null> {
  try {
    const mapping = await UserImageSlot.findOne({ userId, slot: 0 });
    if (!mapping) return null;

    const img = await UserImage.findById(mapping.userImageId);
    if (!img) return null;

    const useUT = process.env.USE_UPLOADTHING === 'true';
    const isUploadThing = typeof img.cloudfrontUrl === 'string' && img.cloudfrontUrl.includes('utfs.io');
    if (isUploadThing || useUT) {
      return img.cloudfrontUrl || null;
    }

    try {
      return generateCloudFrontSignedUrl((img as any).s3Key);
    } catch (error) {
      return generateS3SignedUrl((img as any).s3Key);
    }
  } catch (e) {
    console.warn('Failed to get slot[0] image for user', userId, e);
    return null;
  }
}

class ChatController {
  // Get active conversations (connected users and groups)
  async getActiveConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      console.log('🔍 [ACTIVE] Looking for active conversations for user ID:', userId);

      // Get all connected users - Mongoose query
      const connections = await Connection.find({
        $or: [
          { userId1: userId },
          { userId2: userId }
        ],
        status: 'connected'
      })
      .populate('userId1', 'id name username')
      .populate('userId2', 'id name username')
      .lean();

      console.log('🔗 [ACTIVE] Found connections:', connections.length);

      const conversations = await Promise.all(
        connections.map(async (connection: any) => {
          // Get the OTHER user, not the same user
          const otherUser = connection.userId1._id.toString() === userId.toString() 
            ? connection.userId2 
            : connection.userId1;
          console.log(`👤 [ACTIVE] Other user: ${otherUser.name} (ID: ${otherUser._id})`);
          
          const conversation = await Conversation.findOne({
            $or: [
              { user1Id: userId, user2Id: otherUser._id },
              { user1Id: otherUser._id, user2Id: userId }
            ]
          });

          console.log(`💬 [ACTIVE] Conversation found:`, conversation ? conversation._id : 'NOT FOUND');

          // Get last message
          let lastMessage = null;
          let lastMessageTime = null;
          if (conversation) {
            const lastMsg = await Message.findOne({ conversationId: conversation._id })
              .sort({ createdAt: -1 })
              .lean();
            if (lastMsg) {
              lastMessage = (lastMsg as any).text;
              lastMessageTime = (lastMsg as any).createdAt;
            }
          }

          // Get unread count
          let unreadCount = 0;
          if (conversation) {
            unreadCount = await Message.countDocuments({
              conversationId: conversation._id,
              senderId: otherUser._id,
              status: { $ne: 'read' }
            });
          }

          const profileImage = await getSlot0ImageUrl(otherUser._id);
          return {
            id: conversation?._id || null,
            userId: otherUser._id,
            name: otherUser.name || otherUser.username || 'Unknown User',
            profileImage,
            lastMessage,
            lastMessageTime,
            isOnline: false,
            unreadCount,
            type: 'individual'
          };
        })
      );

      // Get user's groups
      const groupMemberships = await GroupMember.find({ userId })
        .populate({
          path: 'groupId',
          match: { isActive: true }
        })
        .lean();

      console.log('👥 [ACTIVE] Found groups:', groupMemberships.length);

      const groupConversations = await Promise.all(
        groupMemberships
          .filter((membership: any) => membership.groupId) // Filter out null groups
          .map(async (membership: any) => {
            const group = membership.groupId;
            
            // Get last message
            const lastMessage = await GroupMessage.findOne({ groupId: group._id })
              .sort({ createdAt: -1 })
              .populate('senderId', 'id name username')
              .lean();

            // Get unread count - messages not in user's read list
            const readMessageIds = await GroupMessageRead.find({ 
              userId, 
              groupId: group._id 
            }).distinct('messageId');

            const unreadCount = await GroupMessage.countDocuments({
              groupId: group._id,
              senderId: { $ne: userId },
              _id: { $nin: readMessageIds }
            });

            const memberCount = await GroupMember.countDocuments({ groupId: group._id });

            return {
              id: `group_${group._id}`,
              groupId: group._id,
              name: group.name,
              profileImage: group.avatarUrl,
              lastMessage: lastMessage ? lastMessage.content : null,
              lastMessageTime: lastMessage ? lastMessage.createdAt : null,
              isOnline: false,
              unreadCount,
              type: 'group',
              memberCount
            };
          })
      );

      const allConversations = [...conversations.filter((conv: any) => conv.id !== null), ...groupConversations];
      
      // Sort by last message time (most recent first)
      allConversations.sort((a: any, b: any) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });

      console.log('✅ [ACTIVE] Returning all conversations:', allConversations.length);

      res.json({
        success: true,
        conversations: allConversations
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

      // Get all matched users using the Match model - Mongoose query
      const matches = await Match.find({
        $or: [
          { userId1: userId },
          { userId2: userId }
        ]
      })
      .populate('userId1', 'id name username')
      .populate('userId2', 'id name username')
      .lean();

      console.log('💕 [MATCHES] Found matches:', matches.length);

      const conversations = await Promise.all(
        matches.map(async (match: any) => {
          // Get the OTHER user, not the same user
          const otherUser = match.userId1._id.toString() === userId.toString() 
            ? match.userId2 
            : match.userId1;
          console.log(`👤 [MATCHES] Other user: ${otherUser.name} (ID: ${otherUser._id})`);
          
          const conversation = await Conversation.findOne({
            $or: [
              { user1Id: userId, user2Id: otherUser._id },
              { user1Id: otherUser._id, user2Id: userId }
            ]
          });

          console.log(`💬 [MATCHES] Conversation found:`, conversation ? conversation._id : 'NOT FOUND');

          // Get last message
          let lastMessage = null;
          let lastMessageTime = null;
          if (conversation) {
            const lastMsg = await Message.findOne({ conversationId: conversation._id })
              .sort({ createdAt: -1 })
              .lean();
            if (lastMsg) {
              lastMessage = (lastMsg as any).text;
              lastMessageTime = (lastMsg as any).createdAt;
            }
          }

          // Get unread count
          let unreadCount = 0;
          if (conversation) {
            unreadCount = await Message.countDocuments({
              conversationId: conversation._id,
              senderId: otherUser._id,
              status: { $ne: 'read' }
            });
          }

          const profileImage = await getSlot0ImageUrl(otherUser._id);
          return {
            id: conversation?._id || null,
            userId: otherUser._id,
            name: otherUser.name || otherUser.username || 'Unknown User',
            profileImage,
            lastMessage,
            lastMessageTime,
            isOnline: false,
            unreadCount
          };
        })
      );

      // Return all matches, even without conversations
      console.log('✅ [MATCHES] Returning all matches:', conversations.length);

      res.json({
        success: true,
        conversations: conversations
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
        _id: conversationId,
        $or: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .populate('senderId', 'id name username')
        .lean();

      const formattedMessages = messages.map((msg: any) => ({
        id: msg._id,
        text: msg.text,
        isSent: msg.senderId._id.toString() === userId.toString(),
        timestamp: msg.createdAt,
        status: msg.status,
        sender: {
          id: msg.senderId._id,
          name: msg.senderId.name || msg.senderId.username || 'Unknown User'
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
        _id: conversationId,
        $or: [
          { user1Id: userId },
          { user2Id: userId }
        ]
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
      conversation.updatedAt = new Date();
      await conversation.save();

      // Get the other user in the conversation
      const otherUserId = conversation.user1Id.toString() === userId.toString() 
        ? conversation.user2Id 
        : conversation.user1Id;

      // Update unread count for the recipient
      await unreadCountService.updateDirectChatUnreadCount((otherUserId as unknown as number), userId, (otherUserId as unknown as number), (newMessage as any)._id);

      // Emit real-time message to recipient if online
      console.log(`📡 Chat Controller - Checking if user ${otherUserId} is online...`);
      if (websocketService.isUserOnline(otherUserId as unknown as number)) {
        console.log(`✅ Chat Controller - User ${otherUserId} is online, emitting new_message`);
        websocketService.emitToUser(otherUserId as unknown as number, 'new_message', {
          conversationId,
          message: {
            id: (newMessage as any)._id,
            text: (newMessage as any).text,
            senderId: (newMessage as any).senderId,
            timestamp: (newMessage as any).createdAt,
            status: (newMessage as any).status
          }
        });
      } else {
        console.log(`❌ Chat Controller - User ${otherUserId} is not online`);
      }

      // Emit confirmation to sender
      if (websocketService.isUserOnline(userId as unknown as number)) {
        websocketService.emitToUser(userId as unknown as number, 'message_sent', {
          messageId: (newMessage as any)._id,
          conversationId,
          message: (newMessage as any).text,
          timestamp: (newMessage as any).createdAt,
          status: (newMessage as any).status
        });
      }

      res.json({
        success: true,
        message: {
          id: newMessage._id,
          text: (newMessage as any).text,
          timestamp: (newMessage as any).createdAt,
          status: (newMessage as any).status
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
        _id: conversationId,
        $or: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Mark all messages from other user as read
      const otherUserId = conversation.user1Id.toString() === userId.toString() 
        ? conversation.user2Id 
        : conversation.user1Id;
      
      await Message.updateMany(
        {
          conversationId,
          senderId: otherUserId,
          status: { $ne: 'read' }
        },
        { $set: { status: 'read' } }
      );

      // Reset unread count for this user in this direct chat
      await unreadCountService.resetUnreadCount(userId, otherUserId as unknown as number, false);

      // Notify sender that messages were read (real-time)
      if (websocketService.isUserOnline(otherUserId as unknown as number)) {
        websocketService.emitToUser(otherUserId as unknown as number, 'messages_read', {
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

      const targetUser = await User.findById(targetUserId)
        .select('id name username')
        .lean();

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        $or: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId }
        ]
      });

      // If conversation doesn't exist, create it
      if (!conversation) {
        conversation = await Conversation.create({
          user1Id: Math.min(userId, Number(targetUserId)),
          user2Id: Math.max(userId, Number(targetUserId))
        });
      }

      const profileImage = await getSlot0ImageUrl((targetUser as any)._id as unknown as number);
      res.json({
        success: true,
        conversation: {
          id: conversation._id,
          userId: targetUser._id,
          name: targetUser.name || targetUser.username || 'Unknown User',
          profileImage
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
        _id: conversationId,
        $or: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Get the other user's ID
      const otherUserId = conversation.user1Id.toString() === userId.toString() 
        ? conversation.user2Id 
        : conversation.user1Id;

      // Get the other user's details
      const otherUser = await User.findById(otherUserId)
        .select('id name username')
        .populate('images', 'cloudfrontUrl')
        .lean();

      if (!otherUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const profileImage = await getSlot0ImageUrl((otherUser as any)._id as unknown as number);
      res.json({
        success: true,
        conversation: {
          id: conversation._id,
          userId: otherUser._id,
          name: otherUser.name || otherUser.username || 'Unknown User',
          profileImage
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
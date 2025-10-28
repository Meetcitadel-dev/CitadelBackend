import { Request, Response } from 'express';
import User from '../models/user.model';
import Connection from '../models/connection.model';
import Match from '../models/match.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import NotificationReadStatus from '../models/notificationReadStatus.model';
import websocketService from '../services/websocket.service';
import UserImage from '../models/userImage.model';
import UserImageSlot from '../models/userImageSlot.model';
import { generateCloudFrontSignedUrl, generateS3SignedUrl } from '../services/s3.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

class EnhancedChatController {
  // Get matched conversations using the new Match model
  async getMatchedConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      console.log('🔍 [ENHANCED MATCHES] Looking for matched conversations for user ID:', userId);

      // Get all matched users using the new Match model - Mongoose query
      const matches = await Match.find({
        $or: [
          { userId1: userId },
          { userId2: userId }
        ]
      })
      .populate('userId1', 'id name username')
      .populate('userId2', 'id name username')
      .lean();

      console.log('💕 [ENHANCED MATCHES] Found matches:', matches.length);

      const conversations = await Promise.all(
        matches.map(async (match: any) => {
          // Get the OTHER user, not the same user
          const otherUser = match.userId1._id.toString() === userId.toString() 
            ? match.userId2 
            : match.userId1;
          console.log(`👤 [ENHANCED MATCHES] Other user: ${otherUser.name} (ID: ${otherUser._id})`);
          
          const conversation = await Conversation.findOne({
            $or: [
              { user1Id: userId, user2Id: otherUser._id },
              { user1Id: otherUser._id, user2Id: userId }
            ]
          });

          console.log(`💬 [ENHANCED MATCHES] Conversation found:`, conversation ? conversation._id : 'NOT FOUND');

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

          // Check if users are connected
          const connection = await Connection.findOne({
            $or: [
              { userId1: userId, userId2: otherUser._id },
              { userId1: otherUser._id, userId2: userId }
            ],
            status: 'connected'
          });

          // Check if users have chat history
          const hasChatHistory = conversation && await Message.countDocuments({
            conversationId: conversation._id
          }) > 0;

          // Determine the case
          let caseType = 'CASE_3'; // Default: Never connected
          if (connection) {
            if (hasChatHistory) {
              caseType = 'CASE_1'; // Already connected + already chatting
            } else {
              caseType = 'CASE_2'; // Already connected + never chatted
            }
          }

          // Resolve profile image for the other user
          const profileImage = await (async () => {
            try {
              // Prefer slot 0
              const mapping = await UserImageSlot.findOne({ userId: otherUser._id, slot: 0 });
              let img: any = null;
              if (mapping) {
                img = await UserImage.findById(mapping.userImageId);
              }

              // Fallback to first available slot
              if (!img) {
                const anyMapping = await UserImageSlot.findOne({ userId: otherUser._id })
                  .sort({ slot: 1 });
                if (anyMapping) {
                  img = await UserImage.findById(anyMapping.userImageId);
                }
              }

              if (!img) return null;

              const useUT = process.env.USE_UPLOADTHING === 'true';
              const isUploadThing = typeof img.cloudfrontUrl === 'string' && img.cloudfrontUrl.includes('utfs.io');
              if (isUploadThing || useUT) {
                return img.cloudfrontUrl;
              }

              try {
                return generateCloudFrontSignedUrl(img.s3Key);
              } catch (error) {
                return generateS3SignedUrl(img.s3Key);
              }
            } catch (e) {
              console.warn('[ENHANCED MATCHES] Failed to resolve profile image for user', otherUser._id, e);
              return null;
            }
          })();

          return {
            id: conversation?._id || null,
            userId: otherUser._id,
            name: otherUser.name || otherUser.username || 'Unknown User',
            profileImage,
            lastMessage,
            lastMessageTime,
            isOnline: false,
            unreadCount,
            caseType,
            isConnected: !!connection,
            hasChatHistory,
            matchData: {
              mutualAdjective: match.mutualAdjective,
              iceBreakingPrompt: match.iceBreakingPrompt,
              matchTimestamp: match.matchTimestamp
            }
          };
        })
      );

      // Return all matches, even without conversations
      console.log('✅ [ENHANCED MATCHES] Returning all matches:', conversations.length);

      res.json({
        success: true,
        conversations: conversations
      });
    } catch (error) {
      console.error('❌ [ENHANCED MATCHES] Error fetching matched conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch matched conversations'
      });
    }
  }

  // Send connection request (Case 3)
  async sendConnectionRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const { targetUserId } = req.body;
      const currentUserId = req.user!.id;

      if (!targetUserId) {
        res.status(400).json({ success: false, message: 'Target user ID is required' });
        return;
      }

      // Check if match exists
      const match = await Match.findOne({
        $or: [
          { userId1: currentUserId, userId2: targetUserId },
          { userId1: targetUserId, userId2: currentUserId }
        ]
      });

      if (!match) {
        res.status(404).json({ success: false, message: 'No match found with this user' });
        return;
      }

      // Check if already connected
      const existingConnection = await Connection.findOne({
        $or: [
          { userId1: currentUserId, userId2: targetUserId },
          { userId1: targetUserId, userId2: currentUserId }
        ],
        status: 'connected'
      });

      if (existingConnection) {
        res.status(400).json({ success: false, message: 'Users are already connected' });
        return;
      }

      // Check if connection request already exists
      let connection = await Connection.findOne({
        $or: [
          { userId1: currentUserId, userId2: targetUserId },
          { userId1: targetUserId, userId2: currentUserId }
        ]
      });

      if (connection) {
        // Update existing connection to requested status
        connection.status = 'requested';
        await connection.save();
      } else {
        // Create new connection request
        connection = await Connection.create({
          userId1: Math.min(currentUserId, targetUserId),
          userId2: Math.max(currentUserId, targetUserId),
          status: 'requested'
        });
      }

      // Create notification for target user
      await NotificationReadStatus.create({
        userId: targetUserId,
        notificationType: 'connection_request',
        notificationId: connection._id,
        isRead: false,
        createdAt: new Date()
      });

      res.json({
        success: true,
        message: 'Connection request sent successfully'
      });

    } catch (error) {
      console.error('❌ Error sending connection request:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Dismiss match prompt
  async dismissMatchPrompt(req: AuthenticatedRequest, res: Response) {
    try {
      const { targetUserId } = req.body;
      const currentUserId = req.user!.id;

      if (!targetUserId) {
        res.status(400).json({ success: false, message: 'Target user ID is required' });
        return;
      }

      // For now, we'll just return success
      // In a real implementation, you might want to track dismissed prompts
      // or implement a more sophisticated dismissal system

      res.json({
        success: true,
        message: 'Match prompt dismissed successfully'
      });

    } catch (error) {
      console.error('❌ Error dismissing match prompt:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Move chat to active section
  async moveChatToActive(req: AuthenticatedRequest, res: Response) {
    try {
      const { targetUserId } = req.body;
      const currentUserId = req.user!.id;

      if (!targetUserId) {
        res.status(400).json({ success: false, message: 'Target user ID is required' });
        return;
      }

      // Check if users are connected
      const connection = await Connection.findOne({
        $or: [
          { userId1: currentUserId, userId2: targetUserId },
          { userId1: targetUserId, userId2: currentUserId }
        ],
        status: 'connected'
      });

      if (!connection) {
        res.status(400).json({ success: false, message: 'Users must be connected to move chat to active' });
        return;
      }

      // For now, we'll just return success
      // In a real implementation, you might want to track which chats are in active vs matches
      // or implement a more sophisticated movement system

      res.json({
        success: true,
        message: 'Chat moved to active section successfully'
      });

    } catch (error) {
      console.error('❌ Error moving chat to active:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Check chat history
  async checkChatHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { targetUserId } = req.params;
      const currentUserId = req.user!.id;

      if (!targetUserId) {
        res.status(400).json({ success: false, message: 'Target user ID is required' });
        return;
      }

      // Find conversation between users
      const conversation = await Conversation.findOne({
        $or: [
          { user1Id: currentUserId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: currentUserId }
        ]
      });

      let hasChatHistory = false;
      if (conversation) {
        const messageCount = await Message.countDocuments({
          conversationId: conversation._id
        });
        hasChatHistory = messageCount > 0;
      }

      res.json({
        success: true,
        hasChatHistory,
        message: hasChatHistory ? 'Users have chat history' : 'No chat history found'
      });

    } catch (error) {
      console.error('❌ Error checking chat history:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Send message with enhanced validation
  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { conversationId, text } = req.body;
      const senderId = req.user!.id;

      if (!conversationId || !text) {
        res.status(400).json({ success: false, message: 'Conversation ID and text are required' });
        return;
      }

      // Get conversation and verify sender is part of it
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        res.status(404).json({ success: false, message: 'Conversation not found' });
        return;
      }

      if (conversation.user1Id.toString() !== senderId.toString() && 
          conversation.user2Id.toString() !== senderId.toString()) {
        res.status(403).json({ success: false, message: 'You are not part of this conversation' });
        return;
      }

      // Check if users are connected (for enhanced system)
      const otherUserId = conversation.user1Id.toString() === senderId.toString() 
        ? conversation.user2Id 
        : conversation.user1Id;
        
      const connection = await Connection.findOne({
        $or: [
          { userId1: senderId, userId2: otherUserId },
          { userId1: otherUserId, userId2: senderId }
        ],
        status: 'connected'
      });

      if (!connection) {
        res.status(403).json({ success: false, message: 'Users must be connected to send messages' });
        return;
      }

      // Create message
      const message = await Message.create({
        conversationId,
        senderId,
        text,
        status: 'sent'
      });

      // Send real-time message via WebSocket (commented out for now)
      // websocketService.sendMessageToUser(otherUserId, {
      //   type: 'new_message',
      //   conversationId,
      //   message: {
      //     id: message._id,
      //     text: message.text,
      //     senderId: message.senderId,
      //     timestamp: message.createdAt
      //   }
      // });

      res.json({
        success: true,
        message: 'Message sent successfully',
        data: {
          id: (message as any)._id,
          text: (message as any).text,
          senderId: (message as any).senderId,
          timestamp: (message as any).createdAt
        }
      });

    } catch (error) {
      console.error('❌ Error sending message:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new EnhancedChatController();
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/user.model';
import UserImage from '../models/userImage.model';
import UserImageSlot from '../models/userImageSlot.model';
import ConnectionRequest from '../models/connectionRequest.model';
import Match from '../models/match.model';
import Connection from '../models/connection.model';
import NotificationReadStatus from '../models/notificationReadStatus.model';
import University from '../models/university.model';
import { generateCloudFrontSignedUrl, generateS3SignedUrl } from '../services/s3.service';
import websocketService from '../services/websocket.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

// Utility function to calculate time ago
function calculateTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

// Helper: get profile image URL from slot[0]
async function getSlot0ImageUrl(userId: number): Promise<string | null> {
  try {
    const mapping = await UserImageSlot.findOne({ where: { userId, slot: 0 } });
    if (!mapping) return null;

    const img = await UserImage.findByPk(mapping.userImageId);
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
    console.warn('Failed to get slot[0] image for user', userId, e);
    return null;
  }
}

// Get all notifications for a user
export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED'
      });
    }

    // Get connection requests
    const connectionRequests = await ConnectionRequest.findAll({
      where: {
        targetId: userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'requester',
          include: [
            {
              model: University,
              as: 'userUniversity'
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get adjective notifications (from Match table)
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
      ],
      order: [['matchTimestamp', 'DESC']]
    });

    // Group matches by mutual adjective
    const matchGroups = new Map<string, any[]>();
    matches.forEach(match => {
      if (!matchGroups.has(match.mutualAdjective)) {
        matchGroups.set(match.mutualAdjective, []);
      }
      matchGroups.get(match.mutualAdjective)!.push(match);
    });

    // Format connection requests with slot[0] profile image
    const formattedConnectionRequests = await Promise.all(connectionRequests.map(async (request) => ({
      id: request.id,
      requesterId: request.requesterId,
      requesterName: (request as any).requester?.name || 'Unknown User',
      requesterLocation: (request as any).requester?.userUniversity?.name || 'Unknown University',
      requesterProfileImage: await getSlot0ImageUrl(request.requesterId),
      status: request.status,
      createdAt: request.createdAt
    })));

    // Format adjective notifications with slot[0] profile images for other users
    const formattedAdjectiveNotifications = await Promise.all(Array.from(matchGroups.entries()).map(async ([mutualAdjective, groupMatches]) => {
      const latestMatch = groupMatches[0];

      // Determine other users and load their slot[0] images
      const otherUsers = await Promise.all(groupMatches.map(async (match: any) => {
        const otherUser = match.userId1 === userId ? match.matchUser2 : match.matchUser1;
        const profileImage = await getSlot0ImageUrl(otherUser.id);
        return {
          id: otherUser.id,
          name: otherUser.name || otherUser.username || 'Unknown User',
          profileImage
        };
      }));

      return {
        id: latestMatch.id,
        adjective: mutualAdjective,
        count: groupMatches.length,
        userIds: otherUsers.map(u => u.id),
        userNames: otherUsers.map(u => u.name),
        userProfileImages: otherUsers.map(u => u.profileImage),
        timeAgo: calculateTimeAgo(latestMatch.matchTimestamp),
        createdAt: latestMatch.matchTimestamp,
        isConnected: latestMatch.isConnected,
        iceBreakingPrompt: latestMatch.iceBreakingPrompt
      };
    }));

    res.json({
      success: true,
      connectionRequests: formattedConnectionRequests,
      adjectiveNotifications: formattedAdjectiveNotifications,
      requestCount: formattedConnectionRequests.length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};

// Handle connection request (accept/reject)
export const handleConnectionRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { requestId, action } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED'
      });
    }

    if (!requestId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Request ID and action are required',
        errorCode: 'MISSING_PARAMETERS'
      });
    }

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "accept" or "reject"',
        errorCode: 'INVALID_ACTION'
      });
    }

    // Find the connection request
    const connectionRequest = await ConnectionRequest.findOne({
      where: {
        id: requestId,
        targetId: userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'requester'
        }
      ]
    });

    if (!connectionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
        errorCode: 'REQUEST_NOT_FOUND'
      });
    }

    // Update the request status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await connectionRequest.update({ status: newStatus });

    let connectionState = null;

    if (action === 'accept') {
      // Create or update connection
      const [connection, created] = await Connection.findOrCreate({
        where: {
          [Op.or]: [
            { userId1: connectionRequest.requesterId, userId2: userId },
            { userId1: userId, userId2: connectionRequest.requesterId }
          ]
        },
        defaults: {
          userId1: connectionRequest.requesterId,
          userId2: userId,
          status: 'connected'
        }
      });

      if (!created) {
        await connection.update({ status: 'connected' });
      }

      connectionState = {
        id: connection.id,
        userId1: connection.userId1,
        userId2: connection.userId2,
        status: connection.status,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt
      };

      // Get accepter details for the notification
      const accepter = await User.findByPk(userId, {
        attributes: ['id', 'name', 'username'],
        include: [
          {
            model: UserImageSlot,
            as: 'imageSlots',
            where: { slot: 0 },
            required: false,
            include: [
              {
                model: UserImage,
                as: 'image'
              }
            ]
          }
        ]
      });

      // Emit real-time connection accepted to requester
      const acceptData = {
        connectionId: connection.id,
        accepterId: userId,
        accepterName: accepter?.name || 'Unknown User',
        accepterUsername: accepter?.username,
        accepterImage: accepter?.imageSlots?.[0]?.image?.cloudfrontUrl || null,
        requestId: connectionRequest.id,
        status: 'connected',
        message: `${accepter?.name || 'Someone'} accepted your connection request`
      };

      websocketService.emitConnectionRequestAccepted(connectionRequest.requesterId, acceptData);
      console.log(`✅ Connection request accepted by ${userId} for requester ${connectionRequest.requesterId}`);
    } else {
      // Get rejecter details for the notification
      const rejecter = await User.findByPk(userId, {
        attributes: ['id', 'name', 'username']
      });

      // Emit real-time connection rejected to requester
      const rejectData = {
        requestId: connectionRequest.id,
        rejecterId: userId,
        rejecterName: rejecter?.name || 'Unknown User',
        status: 'rejected',
        message: `Your connection request was declined`
      };

      websocketService.emitConnectionRequestRejected(connectionRequest.requesterId, rejectData);
      console.log(`❌ Connection request rejected by ${userId} for requester ${connectionRequest.requesterId}`);
    }

    res.json({
      success: true,
      message: `Request ${action}ed successfully`,
      connectionState
    });

  } catch (error) {
    console.error('Error handling connection request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;
    const { notificationType } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED'
      });
    }

    if (!notificationId || !notificationType) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID and type are required',
        errorCode: 'MISSING_PARAMETERS'
      });
    }

    if (!['connection_request', 'adjective_notification'].includes(notificationType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type',
        errorCode: 'INVALID_NOTIFICATION_TYPE'
      });
    }

    // Create or update read status
    await NotificationReadStatus.upsert({
      userId,
      notificationId: parseInt(notificationId),
      notificationType,
      isRead: true,
      readAt: new Date()
    });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};
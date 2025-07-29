import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/user.model';
import ConnectionRequest from '../models/connectionRequest.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import Connection from '../models/connection.model';
import NotificationReadStatus from '../models/notificationReadStatus.model';
import University from '../models/university.model';

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
              as: 'university'
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get adjective notifications (from AdjectiveMatch table)
    const adjectiveMatches = await AdjectiveMatch.findAll({
      where: {
        userId2: userId // Get adjectives selected for the current user
      },
      include: [
        {
          model: User,
          as: 'user1' // The user who selected the adjective
        }
      ],
      order: [['timestamp', 'DESC']]
    });

    // Group adjective matches by adjective
    const adjectiveGroups = new Map<string, any[]>();
    adjectiveMatches.forEach(match => {
      if (!adjectiveGroups.has(match.adjective)) {
        adjectiveGroups.set(match.adjective, []);
      }
      adjectiveGroups.get(match.adjective)!.push(match);
    });

    // Format connection requests
    const formattedConnectionRequests = connectionRequests.map(request => ({
      id: request.id,
      requesterId: request.requesterId,
      requesterName: (request as any).requester?.name || 'Unknown User',
      requesterLocation: (request as any).requester?.university?.name || 'Unknown University',
      requesterProfileImage: (request as any).requester?.images?.[0]?.imageUrl || null,
      status: request.status,
      createdAt: request.createdAt
    }));

    // Format adjective notifications
    const formattedAdjectiveNotifications = Array.from(adjectiveGroups.entries()).map(([adjective, matches]) => {
      const latestMatch = matches[0];
      const userIds = matches.map(m => m.userId1);
      const userNames = matches.map(m => m.user1?.name || 'Unknown User');
      const userProfileImages = matches.map(m => m.user1?.images?.[0]?.imageUrl || null);

      return {
        id: latestMatch.id,
        adjective,
        count: matches.length,
        userIds,
        userNames,
        userProfileImages,
        timeAgo: calculateTimeAgo(latestMatch.timestamp),
        createdAt: latestMatch.timestamp
      };
    });

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
import { Request, Response } from 'express';
import User from '../models/user.model';
import UserImage from '../models/userImage.model';
import University from '../models/university.model';
import Connection from '../models/connection.model';
import ConnectionRequest from '../models/connectionRequest.model';
import { generateCloudFrontSignedUrl, generateS3SignedUrl } from '../services/s3.service';
import { Op } from 'sequelize';

// Get user profile by username
export const getUserProfileByUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const currentUserId = (req as any).user?.id;

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is required' 
      });
    }

    // Find user by username
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: University,
          as: 'userUniversity'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is viewing their own profile
    const isOwnProfile = currentUserId === user.id;

    // Get user images
    const images = await UserImage.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
    });

    // Generate URLs per-image: preserve UploadThing URLs, sign only S3 images
    const imagesWithFreshUrls = await Promise.all(
      images.map(async (img) => {
        const isUploadThing = typeof img.cloudfrontUrl === 'string' && img.cloudfrontUrl.includes('utfs.io');
        if (isUploadThing) {
          return {
            id: img.id,
            cloudfrontUrl: img.cloudfrontUrl,
            originalName: img.originalName,
            mimeType: img.mimeType,
            fileSize: img.fileSize,
            createdAt: img.createdAt
          };
        }

        let freshUrl: string;
        try {
          freshUrl = generateCloudFrontSignedUrl(img.s3Key);
        } catch (error) {
          console.warn('CloudFront signing failed for image', img.id, 'using S3 signed URL as fallback:', error);
          freshUrl = generateS3SignedUrl(img.s3Key);
        }

        return {
          id: img.id,
          cloudfrontUrl: freshUrl,
          originalName: img.originalName,
          mimeType: img.mimeType,
          fileSize: img.fileSize,
          createdAt: img.createdAt
        };
      })
    );

    // Get connection state between current user and target user
    let connectionState = null;
    if (!isOwnProfile) {
      const connection = await Connection.findOne({
        where: {
          [Op.or]: [
            { userId1: currentUserId, userId2: user.id },
            { userId1: user.id, userId2: currentUserId }
          ]
        }
      });

      if (connection) {
        connectionState = {
          id: connection.id,
          status: connection.status,
          requesterId: connection.userId1,
          targetId: connection.userId2,
          createdAt: connection.createdAt,
          updatedAt: connection.updatedAt
        };
      } else {
        // Check for pending connection requests
        const request = await ConnectionRequest.findOne({
          where: {
            [Op.or]: [
              { requesterId: currentUserId, targetId: user.id },
              { requesterId: user.id, targetId: currentUserId }
            ]
          }
        });

        if (request) {
          connectionState = {
            id: request.id,
            status: request.status === 'pending' ? 'requested' : request.status,
            requesterId: request.requesterId,
            targetId: request.targetId,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt
          };
        }
      }
    }

    // Get connections count for the target user
    const connectionsCount = await Connection.count({
      where: {
        [Op.or]: [
          { userId1: user.id, status: 'connected' },
          { userId2: user.id, status: 'connected' }
        ]
      }
    });

    // Get mutual connections count if not own profile
    let mutualConnectionsCount = 0;
    if (!isOwnProfile) {
      const currentUserConnections = await Connection.findAll({
        where: {
          [Op.or]: [
            { userId1: currentUserId, status: 'connected' },
            { userId2: currentUserId, status: 'connected' }
          ]
        }
      });

      const targetUserConnections = await Connection.findAll({
        where: {
          [Op.or]: [
            { userId1: user.id, status: 'connected' },
            { userId2: user.id, status: 'connected' }
          ]
        }
      });

      const currentUserConnectionIds = currentUserConnections.map(conn => 
        conn.userId1 === currentUserId ? conn.userId2 : conn.userId1
      );

      const targetUserConnectionIds = targetUserConnections.map(conn => 
        conn.userId1 === user.id ? conn.userId2 : conn.userId1
      );

      // Find intersection
      const mutualConnectionIds = currentUserConnectionIds.filter(id => 
        targetUserConnectionIds.includes(id)
      );

      mutualConnectionsCount = mutualConnectionIds.length;
    }

    // Get actual connections for the target user
    const userConnections = await Connection.findAll({
      where: {
        [Op.or]: [
          { userId1: user.id, status: 'connected' },
          { userId2: user.id, status: 'connected' }
        ]
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

    // Format connections data
    const connections = userConnections.map(conn => {
      const isUser1 = conn.userId1 === user.id;
      const connectedUser = isUser1 ? conn.userId2 : conn.userId1;
      const connectedUserData = isUser1 ? (conn as any).connectionUser2 : (conn as any).connectionUser1;
      return {
        id: connectedUser,
        name: connectedUserData?.name || 'Unknown User'
      };
    });

    // Prepare profile data
    const profileData = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: isOwnProfile ? user.email : undefined, // Hide email for other users
      university: (user as any).userUniversity ? {
        id: (user as any).userUniversity.id,
        name: (user as any).userUniversity.name,
        domain: (user as any).userUniversity.domain,
        country: (user as any).userUniversity.country
      } : null,
      degree: user.degree,
      year: user.year,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null,
      skills: Array.isArray(user.skills) ? user.skills : [],
      aboutMe: user.aboutMe,
      sports: user.sports,
      movies: user.movies,
      tvShows: user.tvShows,
      teams: user.teams,
      portfolioLink: user.portfolioLink,
      phoneNumber: isOwnProfile ? user.phoneNumber : undefined, // Hide phone for other users
      connections: connections,
      connectionsCount,
      mutualConnectionsCount,
      isProfileComplete: user.isProfileComplete,
      isEmailVerified: isOwnProfile ? user.isEmailVerified : undefined,
      images: imagesWithFreshUrls,
      connectionState,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profileData
    });
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve profile' 
    });
  }
};

// Get mutual friends list
export const getMutualFriends = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const currentUserId = (req as any).user?.id;

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is required' 
      });
    }

    // Find target user
    const targetUser = await User.findOne({
      where: { username }
    });

    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get current user's connections
    const currentUserConnections = await Connection.findAll({
      where: {
        [Op.or]: [
          { userId1: currentUserId, status: 'connected' },
          { userId2: currentUserId, status: 'connected' }
        ]
      }
    });

    // Get target user's connections
    const targetUserConnections = await Connection.findAll({
      where: {
        [Op.or]: [
          { userId1: targetUser.id, status: 'connected' },
          { userId2: targetUser.id, status: 'connected' }
        ]
      }
    });

    const currentUserFriendIds = currentUserConnections.map(conn => 
      conn.userId1 === currentUserId ? conn.userId2 : conn.userId1
    );

    const targetUserFriendIds = targetUserConnections.map(conn => 
      conn.userId1 === targetUser.id ? conn.userId2 : conn.userId1
    );

    // Find intersection
    const mutualFriendIds = currentUserFriendIds.filter(id => 
      targetUserFriendIds.includes(id)
    );

    // Get mutual friends details
    const mutualFriends = await User.findAll({
      where: {
        id: {
          [Op.in]: mutualFriendIds
        }
      },
      attributes: ['id', 'name', 'username'],
      include: [
        {
          model: UserImage,
          as: 'images',
          attributes: ['cloudfrontUrl'],
          limit: 1,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    const formattedMutualFriends = mutualFriends.map(friend => ({
      id: friend.id,
      name: friend.name,
      username: friend.username,
      profileImage: (friend as any).images && (friend as any).images.length > 0 
        ? (friend as any).images[0].cloudfrontUrl 
        : null
    }));

    res.json({
      success: true,
      message: 'Mutual connections retrieved successfully',
      data: {
        mutualConnections: formattedMutualFriends,
        totalCount: formattedMutualFriends.length
      }
    });
  } catch (error) {
    console.error('Error retrieving mutual friends:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve mutual friends' 
    });
  }
};

// Generate username from name
export const generateUsername = async (name: string): Promise<string> => {
  const baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);

  let username = baseUsername;
  let counter = 1;

  while (true) {
    const existingUser = await User.findOne({ where: { username } });
    if (!existingUser) {
      break;
    }
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};

// Update user's username
export const updateUsername = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { username } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is required' 
      });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores' 
      });
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is already taken' 
      });
    }

    // Update user's username
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await user.update({ username });

    res.json({
      success: true,
      message: 'Username updated successfully',
      data: { username }
    });
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update username' 
    });
  }
}; 
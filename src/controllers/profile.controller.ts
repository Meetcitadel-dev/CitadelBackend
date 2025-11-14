import { Request, Response } from 'express';
import User from '../models/user.model';
import UserImage from '../models/userImage.model';
import University from '../models/university.model';
import UserImageSlot from '../models/userImageSlot.model';
import Connection from '../models/connection.model';
import ConnectionRequest from '../models/connectionRequest.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import Interaction from '../models/interaction.model';
import AdjectiveMatch from '../models/adjectiveMatch.model';
import NotificationReadStatus from '../models/notificationReadStatus.model';
import UserOnlineStatus from '../models/userOnlineStatus.model';
import { uploadImage, generateS3Key, generateCloudFrontSignedUrl, generateS3SignedUrl, deleteImage } from '../services/s3.service';
import { utUploadImageFromBuffer, utDeleteImageByKey } from '../services/uploadthing.service';
const Op = {} as any; // Placeholder for legacy Sequelize operators

export const uploadUserImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    const useUT = process.env.USE_UPLOADTHING === 'true';

    let cloudfrontUrl: string;
    let s3Key: string;
    let storedMime = mimetype;
    let storedSize = size;

    if (useUT) {
      console.log('[upload] Using UploadThing provider');
      // Upload to UploadThing
      const uploaded = await utUploadImageFromBuffer(buffer, originalname, mimetype);
      cloudfrontUrl = uploaded.url; // keep response field name for client compatibility
      s3Key = uploaded.key; // store provider key in existing s3Key column to avoid schema change
      if (uploaded.type) storedMime = uploaded.type;
      if (uploaded.size) storedSize = uploaded.size;
    } else {
      console.log('[upload] Using S3 provider');
      // S3 path (unchanged)
      s3Key = generateS3Key(userId, originalname);
      await uploadImage(buffer, s3Key, mimetype);
      try {
        cloudfrontUrl = generateCloudFrontSignedUrl(s3Key);
      } catch (error) {
        console.warn('CloudFront signing failed, using S3 signed URL as fallback:', error);
        cloudfrontUrl = generateS3SignedUrl(s3Key);
      }
    }

    // Save to database (reuse existing columns for zero-downtime)
    const userImage = await (UserImage as any).create({
      userId,
      s3Key,
      cloudfrontUrl,
      originalName: originalname,
      mimeType: storedMime,
      fileSize: storedSize,
    });

    res.status(201).json({
      message: 'Image uploaded successfully',
      data: {
        id: userImage.id,
        s3Key: (userImage as any).s3Key,
        cloudfrontUrl: userImage.cloudfrontUrl,
        originalName: (userImage as any).originalName,
        mimeType: (userImage as any).mimeType,
        fileSize: (userImage as any).fileSize,
        createdAt: userImage.createdAt,
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

export const getUserImages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const images = await UserImage.find({ userId }).sort({ createdAt: -1 });

    const useUT = process.env.USE_UPLOADTHING === 'true';

    // Build URLs depending on provider
    const imagesWithFreshUrls = await Promise.all(
      images.map(async (img) => {
        if (useUT) {
          return {
            id: img.id,
            userId: img.userId,
            s3Key: (img as any).s3Key, // UploadThing key stored here
            cloudfrontUrl: img.cloudfrontUrl, // already a public URL from UploadThing
            originalName: (img as any).originalName,
            mimeType: (img as any).mimeType,
            fileSize: (img as any).fileSize,
            createdAt: img.createdAt,
            updatedAt: img.updatedAt
          };
        }

        let freshUrl;
        try {
          freshUrl = generateCloudFrontSignedUrl((img as any).s3Key);
        } catch (error) {
          console.warn('CloudFront signing failed for image', img._id, 'using S3 signed URL as fallback:', error);
          freshUrl = generateS3SignedUrl((img as any).s3Key);
        }
        return {
          id: img.id,
          userId: img.userId,
          s3Key: (img as any).s3Key,
          cloudfrontUrl: freshUrl,
          originalName: (img as any).originalName,
          mimeType: (img as any).mimeType,
          fileSize: (img as any).fileSize,
          createdAt: img.createdAt,
          updatedAt: img.updatedAt
        };
      })
    );

    res.json({
      message: 'Images retrieved successfully',
      data: imagesWithFreshUrls,
    });
  } catch (error) {
    console.error('Error retrieving images:', error);
    res.status(500).json({ error: 'Failed to retrieve images' });
  }
};

export const assignImageToSlot = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { slot, userImageId } = req.body as { slot: number; userImageId: number };

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!Number.isInteger(slot) || slot < 0 || slot > 4) {
      return res.status(400).json({ error: 'slot must be an integer between 0 and 4' });
    }

    // Verify image belongs to user
    const image = await UserImage.findOne({ _id: userImageId, userId });
    if (!image) {
      return res.status(404).json({ error: 'Image not found for this user' });
    }

    // Upsert mapping for (userId, slot)
    const existing = await UserImageSlot.findOne({ userId, slot });
    if (existing) {
      existing.userImageId = (image as any)._id.toString();
      existing.assignedAt = new Date();
      await existing.save();
    } else {
      await UserImageSlot.create({ userId, slot, userImageId: (image as any)._id.toString() });
    }

    return res.json({ message: 'Slot assigned successfully' });
  } catch (error) {
    console.error('Error assigning image to slot:', error);
    return res.status(500).json({ error: 'Failed to assign image to slot' });
  }
};

export const clearImageSlot = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const slot = parseInt(req.params.slot, 10);

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!Number.isInteger(slot) || slot < 0 || slot > 4) {
      return res.status(400).json({ error: 'slot must be an integer between 0 and 4' });
    }

    const result = await UserImageSlot.deleteOne({ userId, slot });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Slot not set' });
    }

    return res.json({ message: 'Slot cleared successfully' });
  } catch (error) {
    console.error('Error clearing image slot:', error);
    return res.status(500).json({ error: 'Failed to clear image slot' });
  }
};

export const deleteUserImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const imageId = parseInt(req.params.imageId);

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the image and ensure it belongs to the user
    const userImage = await UserImage.findOne({
      _id: imageId, userId,
    });

    if (!userImage) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const useUT = process.env.USE_UPLOADTHING === 'true';
    if (useUT) {
      await utDeleteImageByKey((userImage as any).s3Key);
    } else {
      // Delete from S3
      await deleteImage((userImage as any).s3Key);
    }

    // Delete from database
    await UserImage.findByIdAndDelete((userImage as any)._id);

    res.json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};

export const getSignedUrl = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const imageId = parseInt(req.params.imageId);

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the image and ensure it belongs to the user
    const userImage = await UserImage.findOne({
      _id: imageId, userId,
    });

    if (!userImage) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const useUT = process.env.USE_UPLOADTHING === 'true';
    let signedUrl;
    if (useUT) {
      // With UploadThing we store a public URL already
      signedUrl = userImage.cloudfrontUrl;
    } else {
      try {
        signedUrl = generateCloudFrontSignedUrl((userImage as any).s3Key);
      } catch (error) {
        console.warn('CloudFront signing failed, using S3 signed URL as fallback:', error);
        signedUrl = generateS3SignedUrl((userImage as any).s3Key);
      }
    }

    res.json({
      message: 'Signed URL generated successfully',
      data: {
        signedUrl,
        expiresIn: 3600, // 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch university data if universityId exists
    let university = null;
    if (user.universityId) {
      university = await University.findById(user.universityId);
    }

    // Fetch slot mappings and resolve images in slot order (0..4)
    const slotMappings = await UserImageSlot.find({ userId }).sort({ slot: 1 });

    const slotToImageId = new Map<number, string>();
    for (const m of slotMappings) {
      slotToImageId.set(m.slot, m.userImageId);
    }

    // Prefetch all images referenced by slots
    const referencedIds = Array.from(slotToImageId.values());
    const referencedImages = referencedIds.length
      ? await UserImage.find({ _id: { $in: referencedIds } })
      : [];
    const idToImage = new Map<string, any>();
    for (const img of referencedImages) idToImage.set(img._id.toString(), img);

    // For library or fallback (optional): still fetch recent images
    const recentImages = await UserImage.find({ userId }).sort({ createdAt: -1 }).limit(20);

    const useUT = process.env.USE_UPLOADTHING === 'true';
    const freshen = async (img: any) => {
        if (useUT) {
          return {
            id: img._id.toString(),
            cloudfrontUrl: img.cloudfrontUrl,
            originalName: (img as any).originalName || null,
            mimeType: (img as any).mimeType || null,
            fileSize: (img as any).fileSize || null,
            createdAt: img.createdAt
          };
        }
        let freshUrl;
        try {
          freshUrl = generateCloudFrontSignedUrl((img as any).s3Key);
        } catch (error) {
          console.warn('CloudFront signing failed for image', img._id, 'using S3 signed URL as fallback:', error);
          freshUrl = generateS3SignedUrl((img as any).s3Key);
        }
        return {
          id: img._id.toString(),
          cloudfrontUrl: freshUrl,
          originalName: (img as any).originalName || null,
          mimeType: (img as any).mimeType || null,
          fileSize: (img as any).fileSize || null,
          createdAt: img.createdAt
        };
    };

    // Build slots array length 5
    const slots = await Promise.all(
      Array.from({ length: 5 }, async (_, i) => {
        const imageId = slotToImageId.get(i);
        if (!imageId) return { slot: i, image: null };
        const img = idToImage.get(imageId);
        if (!img) return { slot: i, image: null };
        const payload = await freshen(img);
        return { slot: i, image: payload };
      })
    );

    const library = await Promise.all(recentImages.map((img: any) => freshen(img)));

    // Prepare profile data
    const profileData = {
      id: user._id.toString(),
      email: user.email,
      name: user.name || null,
      username: user.username || null,
      university: university ? {
        id: university._id.toString(),
        name: university.name,
        domain: university.domain,
        country: university.country
      } : null,
      degree: user.degree || null,
      year: user.year || null,
      gender: user.gender || null,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
      skills: Array.isArray(user.skills) ? user.skills : [],
      aboutMe: user.aboutMe || null,
      sports: user.sports || null,
      movies: user.movies || null,
      tvShows: user.tvShows || null,
      teams: user.teams || null,
      portfolioLink: user.portfolioLink || null,
      phoneNumber: user.phoneNumber || null,
      friends: Array.isArray(user.friends) ? user.friends : [],
      isProfileComplete: user.isProfileComplete,
      isEmailVerified: user.isEmailVerified,
      images: library,
      slots,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profileData
    });
  } catch (error) {
    console.error('Error retrieving profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve profile' 
    });
  }
};

export const testSignedUrl = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get the first image for the user
    const userImage = await UserImage.findOne({ userId }).sort({ createdAt: -1 });

    if (!userImage) {
      return res.status(404).json({ error: 'No images found for user' });
    }

    // Check CloudFront configuration
    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
    const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
    const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY;

    const configCheck = {
      hasCloudFrontDomain: !!cloudfrontDomain,
      hasKeyPairId: !!keyPairId,
      hasPrivateKey: !!privateKey,
      privateKeyLength: privateKey ? privateKey.length : 0,
      privateKeyStartsWithHeader: privateKey ? privateKey.includes('-----BEGIN') : false,
      privateKeyEndsWithFooter: privateKey ? privateKey.includes('-----END') : false,
      allCloudFrontVarsPresent: !!(cloudfrontDomain && keyPairId && privateKey)
    };

    // Generate fresh signed URLs
    let cloudfrontUrl: string | null, s3Url: string | null, cloudfrontError: string | null, s3Error: string | null;
    
    try {
      cloudfrontUrl = generateCloudFrontSignedUrl((userImage as any).s3Key);
      cloudfrontError = null;
    } catch (error) {
      cloudfrontError = error instanceof Error ? error.message : String(error);
      cloudfrontUrl = null;
    }
    
    try {
      s3Url = generateS3SignedUrl((userImage as any).s3Key);
      s3Error = null;
    } catch (error) {
      s3Error = error instanceof Error ? error.message : String(error);
      s3Url = null;
    }

    res.json({
      message: 'Signed URL test',
      data: {
        originalUrl: userImage.cloudfrontUrl,
        s3Key: (userImage as any).s3Key,
        cloudfrontUrl,
        s3Url,
        cloudfrontError,
        s3Error,
        bucket: process.env.AWS_S3_BUCKET,
        region: process.env.AWS_REGION,
        configCheck,
        // Additional debugging info
        cloudfrontDomain: cloudfrontDomain ? `${cloudfrontDomain.substring(0, 10)}...` : null,
        keyPairId: keyPairId ? `${keyPairId.substring(0, 10)}...` : null,
        privateKeyPreview: privateKey ? `${privateKey.substring(0, 50)}...` : null
      },
    });
  } catch (error) {
    console.error('Error testing signed URL:', error);
    res.status(500).json({ error: 'Failed to test signed URL' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const {
      name,
      gender,
      degree,
      year,
      skills,
      aboutMe,
      sports,
      movies,
      tvShows,
      teams,
      portfolioLink,
      phoneNumber,
      dateOfBirth
    } = req.body;

    // Validation
    const errors: { [key: string]: string[] } = {};

    if (name && name.length > 100) {
      errors.name = ['Name cannot exceed 100 characters'];
    }

    if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
      errors.gender = ['Gender must be one of: Male, Female, Other'];
    }

    if (degree && degree.length > 100) {
      errors.degree = ['Degree cannot exceed 100 characters'];
    }

    if (year && year.length > 10) {
      errors.year = ['Year cannot exceed 10 characters'];
    }

    if (skills && Array.isArray(skills) && skills.length > 10) {
      errors.skills = ['Skills cannot exceed 10 items'];
    }

    if (aboutMe && aboutMe.length > 140) {
      errors.aboutMe = ['About me cannot exceed 140 characters'];
    }

    if (sports && sports.length > 255) {
      errors.sports = ['Sports cannot exceed 255 characters'];
    }

    if (movies && movies.length > 255) {
      errors.movies = ['Movies cannot exceed 255 characters'];
    }

    if (tvShows && tvShows.length > 255) {
      errors.tvShows = ['TV shows cannot exceed 255 characters'];
    }

    if (teams && teams.length > 255) {
      errors.teams = ['Teams cannot exceed 255 characters'];
    }

    if (portfolioLink && portfolioLink.length > 500) {
      errors.portfolioLink = ['Portfolio link cannot exceed 500 characters'];
    }

    if (phoneNumber && phoneNumber.length > 20) {
      errors.phoneNumber = ['Phone number cannot exceed 20 characters'];
    }

    // Validate date format if provided
    if (dateOfBirth) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateOfBirth)) {
        errors.dateOfBirth = ['Date of birth must be in YYYY-MM-DD format'];
      }
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Update user profile
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (gender !== undefined) updateData.gender = gender;
    if (degree !== undefined) updateData.degree = degree;
    if (year !== undefined) updateData.year = year;
    if (skills !== undefined) updateData.skills = skills;
    if (aboutMe !== undefined) updateData.aboutMe = aboutMe;
    if (sports !== undefined) updateData.sports = sports;
    if (movies !== undefined) updateData.movies = movies;
    if (tvShows !== undefined) updateData.tvShows = tvShows;
    if (teams !== undefined) updateData.teams = teams;
    if (portfolioLink !== undefined) updateData.portfolioLink = portfolioLink;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);

    await user.updateOne(updateData);

    // Fetch updated user with university data
    const updatedUser = await User.findById(userId);
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found after update' 
      });
    }
    const university = updatedUser.universityId ? await University.findById(updatedUser.universityId) : null;

    // Fetch user images
    const images = await UserImage.find({ userId }).sort({ createdAt: -1 });

    // Generate fresh signed URLs for all images
    const imagesWithFreshUrls = await Promise.all(
      images.map(async (img: any) => {
        let freshUrl;
        try {
          freshUrl = generateCloudFrontSignedUrl((img as any).s3Key);
        } catch (error) {
          console.warn('CloudFront signing failed for image', img._id, 'using S3 signed URL as fallback:', error);
          freshUrl = generateS3SignedUrl((img as any).s3Key);
        }
        
        return {
          id: img._id.toString(),
          cloudfrontUrl: freshUrl,
          originalName: (img as any).originalName || null,
          mimeType: (img as any).mimeType || null,
          fileSize: (img as any).fileSize || null,
          createdAt: img.createdAt
        };
      })
    );

    // Prepare response data
    const responseData = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      university: university ? {
        id: university._id.toString(),
        name: university.name,
        domain: university.domain,
        country: university.country
      } : null,
      degree: updatedUser!.degree,
      year: updatedUser!.year,
      gender: updatedUser!.gender,
      dateOfBirth: updatedUser!.dateOfBirth ? updatedUser!.dateOfBirth.toISOString().split('T')[0] : null,
      skills: Array.isArray(updatedUser!.skills) ? updatedUser!.skills : [],
      aboutMe: updatedUser!.aboutMe,
      sports: updatedUser!.sports,
      movies: updatedUser!.movies,
      tvShows: updatedUser!.tvShows,
      teams: updatedUser!.teams,
      portfolioLink: updatedUser!.portfolioLink,
      phoneNumber: updatedUser!.phoneNumber,
      friends: Array.isArray(updatedUser!.friends) ? updatedUser!.friends : [],
      isProfileComplete: updatedUser!.isProfileComplete,
      isEmailVerified: updatedUser!.isEmailVerified,
      images: imagesWithFreshUrls,
      createdAt: updatedUser!.createdAt,
      updatedAt: updatedUser!.updatedAt
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
};

// Delete account functionality
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log(`🗑️  Starting account deletion for user ${userId} (${user.email})`);

    // 1. Delete all user images from S3 and database
    const userImages = await UserImage.find({ userId });
    console.log(`📸 Deleting ${userImages.length} user images`);
    
    const useUT = process.env.USE_UPLOADTHING === 'true';
    for (const image of userImages) {
      try {
        if (useUT) {
          await utDeleteImageByKey((image as any).s3Key);
        } else {
          await deleteImage((image as any).s3Key);
        }
        console.log(`✅ Deleted image from storage: ${(image as any).s3Key}`);
      } catch (error) {
        console.warn(`⚠️  Failed to delete image from storage: ${(image as any).s3Key}`, error);
      }
    }
    await UserImage.deleteMany({ userId });

    // 2. Delete all connections where user is involved
    console.log('🔗 Deleting user connections');
    await (Connection as any).destroy({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      }
    });

    // 3. Delete all connection requests where user is involved
    console.log('📨 Deleting connection requests');
    await (ConnectionRequest as any).destroy({
      where: {
        [Op.or]: [
          { requesterId: userId },
          { targetId: userId }
        ]
      }
    });

    // 4. Delete all conversations where user is involved
    console.log('💬 Deleting conversations');
    const userConversations = await (Conversation as any).findAll({
      where: {
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });
    
    for (const conversation of userConversations) {
      // Delete all messages in the conversation
      await (Message as any).destroy({ where: { conversationId: (conversation as any).id } });
    }
    await (Conversation as any).destroy({
      where: {
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    // 5. Delete all interactions where user is involved
    console.log('👁️  Deleting user interactions');
    await (Interaction as any).destroy({
      where: {
        [Op.or]: [
          { userId: userId },
          { targetUserId: userId }
        ]
      }
    });

    // 6. Delete all adjective matches where user is involved
    console.log('🎯 Deleting adjective matches');
    await (AdjectiveMatch as any).destroy({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      }
    });

    // 7. Delete notification read status
    console.log('🔔 Deleting notification read status');
    await (NotificationReadStatus as any).destroy({ where: { userId } });

    // 8. Delete user online status
    console.log('🟢 Deleting user online status');
    await (UserOnlineStatus as any).destroy({ where: { userId } });

    // 9. Finally, delete the user account
    console.log('👤 Deleting user account');
    await (user as any).destroy();

    console.log(`✅ Account deletion completed for user ${userId}`);

    return res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting account:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete account' 
    });
  }
};

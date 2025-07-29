import { Request, Response } from 'express';
import User from '../models/user.model';
import UserImage from '../models/userImage.model';
import University from '../models/university.model';
import { uploadImage, generateS3Key, generateCloudFrontSignedUrl, generateS3SignedUrl, deleteImage } from '../services/s3.service';

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
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    // Generate S3 key
    const s3Key = generateS3Key(userId, originalname);

    // Upload to S3
    await uploadImage(buffer, s3Key, mimetype);

    // Generate CloudFront signed URL (with fallback)
    let cloudfrontUrl;
    try {
      cloudfrontUrl = generateCloudFrontSignedUrl(s3Key);
    } catch (error) {
      console.warn('CloudFront signing failed, using S3 signed URL as fallback:', error);
      cloudfrontUrl = generateS3SignedUrl(s3Key);
    }

    // Save to database
    const userImage = await UserImage.create({
      userId,
      s3Key,
      cloudfrontUrl,
      originalName: originalname,
      mimeType: mimetype,
      fileSize: size,
    });

    res.status(201).json({
      message: 'Image uploaded successfully',
      data: {
        id: userImage.id,
        s3Key: userImage.s3Key,
        cloudfrontUrl: userImage.cloudfrontUrl,
        originalName: userImage.originalName,
        mimeType: userImage.mimeType,
        fileSize: userImage.fileSize,
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

    const images = await UserImage.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    // Generate fresh signed URLs for all images
    const imagesWithFreshUrls = await Promise.all(
      images.map(async (img) => {
        let freshUrl;
        try {
          freshUrl = generateCloudFrontSignedUrl(img.s3Key);
        } catch (error) {
          console.warn('CloudFront signing failed for image', img.id, 'using S3 signed URL as fallback:', error);
          freshUrl = generateS3SignedUrl(img.s3Key);
        }
        
        return {
          id: img.id,
          userId: img.userId,
          s3Key: img.s3Key,
          cloudfrontUrl: freshUrl,
          originalName: img.originalName,
          mimeType: img.mimeType,
          fileSize: img.fileSize,
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

export const deleteUserImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const imageId = parseInt(req.params.imageId);

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the image and ensure it belongs to the user
    const userImage = await UserImage.findOne({
      where: { id: imageId, userId },
    });

    if (!userImage) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from S3
    await deleteImage(userImage.s3Key);

    // Delete from database
    await userImage.destroy();

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
      where: { id: imageId, userId },
    });

    if (!userImage) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Generate a new signed URL
    let signedUrl;
    try {
      signedUrl = generateCloudFrontSignedUrl(userImage.s3Key);
    } catch (error) {
      console.warn('CloudFront signing failed, using S3 signed URL as fallback:', error);
      signedUrl = generateS3SignedUrl(userImage.s3Key);
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
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch university data if universityId exists
    let university = null;
    if (user.universityId) {
      university = await University.findByPk(user.universityId);
    }

    // Fetch user images
    const images = await UserImage.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    // Generate fresh signed URLs for all images
    const imagesWithFreshUrls = await Promise.all(
      images.map(async (img) => {
        let freshUrl;
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

    // Prepare profile data
    const profileData = {
      id: user.id,
      email: user.email,
      name: user.name || null,
      university: university ? {
        id: university.id,
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
      images: imagesWithFreshUrls,
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
    const userImage = await UserImage.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

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
    let cloudfrontUrl, s3Url, cloudfrontError, s3Error;
    
    try {
      cloudfrontUrl = generateCloudFrontSignedUrl(userImage.s3Key);
      cloudfrontError = null;
    } catch (error) {
      cloudfrontError = error instanceof Error ? error.message : String(error);
      cloudfrontUrl = null;
    }
    
    try {
      s3Url = generateS3SignedUrl(userImage.s3Key);
      s3Error = null;
    } catch (error) {
      s3Error = error instanceof Error ? error.message : String(error);
      s3Url = null;
    }

    res.json({
      message: 'Signed URL test',
      data: {
        originalUrl: userImage.cloudfrontUrl,
        s3Key: userImage.s3Key,
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
    const user = await User.findByPk(userId);
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

    await user.update(updateData);

    // Fetch updated user with university data
    const updatedUser = await User.findByPk(userId);
    const university = updatedUser?.universityId ? await University.findByPk(updatedUser.universityId) : null;

    // Fetch user images
    const images = await UserImage.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    // Generate fresh signed URLs for all images
    const imagesWithFreshUrls = await Promise.all(
      images.map(async (img) => {
        let freshUrl;
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

    // Prepare response data
    const responseData = {
      id: updatedUser!.id,
      name: updatedUser!.name,
      email: updatedUser!.email,
      university: university ? {
        id: university.id,
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

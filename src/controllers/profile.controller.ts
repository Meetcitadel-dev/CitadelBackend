import { Request, Response } from 'express';
import User from '../models/user.model';
import UserImage from '../models/userImage.model';
import { uploadImage, generateS3Key, generateCloudFrontSignedUrl, deleteImage } from '../services/s3.service';

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
      console.warn('CloudFront signing failed, using S3 URL as fallback:', error);
      cloudfrontUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
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

    res.json({
      message: 'Images retrieved successfully',
      data: images,
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
      console.warn('CloudFront signing failed, using S3 URL as fallback:', error);
      signedUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${userImage.s3Key}`;
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

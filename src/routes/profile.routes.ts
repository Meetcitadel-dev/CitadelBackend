import { Router } from 'express';
import { uploadUserImage, getUserImages, deleteUserImage, getSignedUrl } from '../controllers/profile.controller';
import { uploadSingleImage, handleUploadError } from '../middlewares/upload.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Upload user image
router.post('/upload', uploadSingleImage, handleUploadError, uploadUserImage);

// Get user images
router.get('/images', getUserImages);

// Delete user image
router.delete('/images/:imageId', deleteUserImage);

// Get signed URL for image
router.get('/images/:imageId/signed-url', getSignedUrl);

export default router;


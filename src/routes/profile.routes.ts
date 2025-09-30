import { Router } from 'express';
import { uploadUserImage, getUserImages, deleteUserImage, getSignedUrl, getMyProfile, testSignedUrl, updateProfile, deleteAccount, assignImageToSlot, clearImageSlot } from '../controllers/profile.controller';
import { uploadSingleImage, handleUploadError } from '../middlewares/upload.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get authenticated user's profile data (personal info + images)
router.get('/me', getMyProfile);

// Upload user image
router.post('/upload', uploadSingleImage, handleUploadError, uploadUserImage);

// Get user images
router.get('/images', getUserImages);

// Delete user image
router.delete('/images/:imageId', deleteUserImage);

// Assign image to slot (0..4)
router.put('/images/slot', assignImageToSlot);

// Clear a slot
router.delete('/images/slot/:slot', clearImageSlot);

// Get signed URL for image
router.get('/images/:imageId/signed-url', getSignedUrl);

// Test signed URL generation (for debugging)
router.get('/test-signed-url', testSignedUrl);

// Update profile
router.put('/update', updateProfile);

// Delete account
router.delete('/delete-account', deleteAccount);

export default router;


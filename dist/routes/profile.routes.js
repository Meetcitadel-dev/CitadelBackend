"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticateToken);
// Get authenticated user's profile data (personal info + images)
router.get('/me', profile_controller_1.getMyProfile);
// Upload user image
router.post('/upload', upload_middleware_1.uploadSingleImage, upload_middleware_1.handleUploadError, profile_controller_1.uploadUserImage);
// Get user images
router.get('/images', profile_controller_1.getUserImages);
// Delete user image
router.delete('/images/:imageId', profile_controller_1.deleteUserImage);
// Get signed URL for image
router.get('/images/:imageId/signed-url', profile_controller_1.getSignedUrl);
// Test signed URL generation (for debugging)
router.get('/test-signed-url', profile_controller_1.testSignedUrl);
// Update profile
router.put('/update', profile_controller_1.updateProfile);
// Delete account
router.delete('/delete-account', profile_controller_1.deleteAccount);
exports.default = router;

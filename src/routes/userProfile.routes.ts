import { Router } from 'express';
import { 
  getUserProfileByUsername, 
  getMutualFriends, 
  updateUsername 
} from '../controllers/userProfile.controller';
import exploreController from '../controllers/explore.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/v1/users/gridview - Grid view endpoint (redirects to explore profiles)
router.get('/gridview', exploreController.getExploreProfiles);

// GET /api/v1/users/gridview/filters - Get available filters for grid view
router.get('/gridview/filters', exploreController.getAvailableFilters);

// GET /api/v1/users/{username} - Get user profile by username
router.get('/:username', getUserProfileByUsername);

// GET /api/v1/users/{username}/mutual-friends - Get mutual friends list
router.get('/:username/mutual-friends', getMutualFriends);

// PUT /api/v1/users/username - Update user's username
router.put('/username', updateUsername);

export default router; 
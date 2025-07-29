import { Router } from 'express';
import exploreController from '../controllers/explore.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/v1/explore/profiles - Fetch explore profiles with matching algorithm
router.get('/profiles', exploreController.getExploreProfiles);

// POST /api/v1/explore/adjectives/select - Select adjective for a profile
router.post('/adjectives/select', exploreController.selectAdjective);

// GET /api/v1/explore/adjectives/check/:targetUserId - Check if user has selected adjective for profile
router.get('/adjectives/check/:targetUserId', exploreController.checkAdjectiveSelection);

// GET /api/v1/explore/adjectives/matches - Get adjective matches for current user
router.get('/adjectives/matches', exploreController.getAdjectiveMatches);

// POST /api/v1/explore/track-view - Track profile view
router.post('/track-view', exploreController.trackProfileView);

export default router; 
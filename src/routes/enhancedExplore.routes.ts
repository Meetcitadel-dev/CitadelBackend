import { Router } from 'express';
import enhancedExploreController from '../controllers/enhancedExplore.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/v1/enhanced-explore/profile/gender - Get user's gender
router.get('/profile/gender', enhancedExploreController.getUserGender);

// GET /api/v1/enhanced-explore/adjectives/selections/:targetUserId - Get adjective selections for a user
router.get('/adjectives/selections/:targetUserId', enhancedExploreController.getAdjectiveSelections);

// GET /api/v1/enhanced-explore/adjectives/available/:targetUserId - Get available adjectives for a profile
router.get('/adjectives/available/:targetUserId', enhancedExploreController.getAvailableAdjectives);

// POST /api/v1/enhanced-explore/adjectives/select - Select adjective for a profile
router.post('/adjectives/select', enhancedExploreController.selectAdjective);

// GET /api/v1/enhanced-explore/matches/state/:targetUserId - Get match state between two users
router.get('/matches/state/:targetUserId', enhancedExploreController.getMatchState);

// POST /api/v1/enhanced-explore/matches/connect - Connect after match
router.post('/matches/connect', enhancedExploreController.connectAfterMatch);

// GET /api/v1/enhanced-explore/matches/ice-breaking/:targetUserId - Get ice-breaking prompt
router.get('/matches/ice-breaking/:targetUserId', enhancedExploreController.getIceBreakingPrompt);

export default router; 
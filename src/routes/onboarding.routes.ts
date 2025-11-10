import { Router } from 'express';
import { completeOnboarding, getOnboardingStatus, saveOnboardingProgress } from '../controllers/onboarding.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication - mounted at /api/v1
router.use(authenticateToken);

// Complete onboarding
router.post('/onboarding', completeOnboarding);

// Get onboarding status
router.get('/onboarding/status', getOnboardingStatus);

// Save onboarding progress
router.post('/onboarding/progress', saveOnboardingProgress);

export default router; 
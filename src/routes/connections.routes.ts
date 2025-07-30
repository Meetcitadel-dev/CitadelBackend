import { Router } from 'express';
import exploreController from '../controllers/explore.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST /api/v1/connections/manage - Manage connection requests
router.post('/manage', exploreController.manageConnection);

// GET /api/v1/connections/status/:targetUserId - Get connection status with specific user
router.get('/status/:targetUserId', exploreController.getConnectionStatus);

// GET /api/v1/connections/count - Get connections count for authenticated user
router.get('/count', exploreController.getConnectionsCount);

export default router; 
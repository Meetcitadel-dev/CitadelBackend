import { Router } from 'express';
import { getUniversities } from '../controllers/university.controller';

const router = Router();

// Public route - no authentication required
router.get('/v1/universities', getUniversities);

export default router;







import { Router } from 'express';
import { getUniversities, createUniversity } from '../controllers/university.controller';

const router = Router();

// Public route - no authentication required
router.get('/universities', getUniversities);

// POST route for creating universities (you might want to add authentication here)
router.post('/universities', createUniversity);

export default router;







import { Router } from 'express';
import { getUniversities } from '../controllers/university.controller';

const router = Router();

router.get('/api/v1/universities', getUniversities);

export default router;







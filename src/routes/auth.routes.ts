import { Router } from 'express';
import { sendOtpController, verifyOtpController } from '../controllers/auth.controller';
import { otpRateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/api/v1/auth/send-otp', otpRateLimit, sendOtpController);
router.post('/api/v1/auth/verify-otp', verifyOtpController);

export default router;

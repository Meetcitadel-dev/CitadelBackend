import { Router } from 'express';
import { sendOtpController, verifyOtpController, refreshTokenController } from '../controllers/auth.controller';
import { otpRateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/send-otp', otpRateLimit, sendOtpController);
router.post('/verify-otp', verifyOtpController);
router.post('/refresh', refreshTokenController);

export default router;

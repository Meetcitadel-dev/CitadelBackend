import { Router } from 'express';
import { sendOtpController, verifyOtpController, refreshTokenController, checkUserExistsController, logoutController } from '../controllers/auth.controller';
import { otpRateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/check-user', checkUserExistsController);
router.post('/send-otp', otpRateLimit, sendOtpController);
router.post('/verify-otp', verifyOtpController);
router.post('/refresh', refreshTokenController);
router.post('/logout', logoutController);

export default router;

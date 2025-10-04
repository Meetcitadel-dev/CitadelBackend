import { Request, Response, NextFunction } from 'express';
import redisClient, { isRedisAvailable, safeRedisCommand } from '../config/redis';

export async function otpRateLimit(req: Request, res: Response, next: NextFunction) {
  const email = req.body.email;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required for rate limiting' });
  const key = `otp_rate_limit:${email}`;
  try {
    if (!isRedisAvailable()) {
      console.warn('Redis unavailable in otpRateLimit; allowing request without Redis rate limit');
      return next();
    }

    const exists = await safeRedisCommand(() => redisClient.get(key));
    if (exists) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please wait before retrying.' });
    }

    await safeRedisCommand(() => redisClient.setEx(key, 60, '1'));
    return next();
  } catch (err) {
    console.error('otpRateLimit encountered an error; bypassing rate limit:', err);
    return next();
  }
}

























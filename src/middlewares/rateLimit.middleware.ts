import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

export async function otpRateLimit(req: Request, res: Response, next: NextFunction) {
  const email = req.body.email;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required for rate limiting' });
  const key = `otp_rate_limit:${email}`;
  const exists = await redisClient.get(key);
  if (exists) {
    return res.status(429).json({ success: false, message: 'Too many requests. Please wait before retrying.' });
  }
  await redisClient.setEx(key, 60, '1'); // 1 minute TTL
  next();
}



















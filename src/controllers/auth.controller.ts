import { Request, Response } from 'express';
import { sendOtp, verifyOtp } from '../services/otp.service';
import { sendEmail } from '../services/email.service';
import { isValidUniversityEmail } from '../utils/validator';
import University from '../models/university.model';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';

export const sendOtpController = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  // Get allowed university domains
  const universities = await University.findAll();
  const allowedDomains = universities.map(u => u.domain);
  if (!isValidUniversityEmail(email, allowedDomains)) {
    return res.status(400).json({ success: false, message: 'Invalid university email domain' });
  }

  try {
    const { otp, expiresIn } = await sendOtp(email);
    await sendEmail(email, 'Your OTP Code', `Your OTP is: ${otp}`);
    // Upsert user
    await User.upsert({ email });
    return res.json({ success: true, message: 'OTP sent successfully', expiresIn });
  } catch (err: any) {
    return res.status(429).json({ success: false, message: err.message });
  }
};

export const verifyOtpController = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const valid = await verifyOtp(email, otp);
  if (!valid) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

  user.isEmailVerified = true;
  user.otpAttempts = 0;
  await user.save();

  // Generate JWT tokens
  const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

  return res.json({
    success: true,
    tokens: { accessToken, refreshToken },
    user: {
      id: user.id,
      email: user.email,
      isProfileComplete: false, // TODO: Implement profile completion check
    },
  });
};













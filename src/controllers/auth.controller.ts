import { Request, Response } from 'express';
import { sendOtp, verifyOtp } from '../services/otp.service';
import { sendEmail } from '../services/email.nodemailer';
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
  const accessToken = jwt.sign({ 
    sub: user.id, 
    username: user.email.split('@')[0], // Use email prefix as username
    role: 'USER', // Default role
    email: user.email 
  }, process.env.JWT_SECRET || 'secret', { expiresIn: '5d' });
  const refreshToken = jwt.sign({ 
    sub: user.id, 
    username: user.email.split('@')[0],
    role: 'USER',
    email: user.email 
  }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

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

export const refreshTokenController = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret') as any;
    const user = await User.findByPk(decoded.sub);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign({ 
      sub: user.id, 
      username: user.email.split('@')[0],
      role: 'USER',
      email: user.email 
    }, process.env.JWT_SECRET || 'secret', { expiresIn: '5d' });

    return res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};













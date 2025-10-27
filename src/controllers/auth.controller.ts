import { Request, Response } from 'express';
import { sendOtp, verifyOtp } from '../services/otp.service';
import { sendEmail } from '../services/email.nodemailer';
import { isValidUniversityEmail } from '../utils/validator';
import University from '../models/university.model';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';

export const checkUserExistsController = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email is required' 
    });
  }

  // Validate university email format
  const universities = await University.find();
  const allowedDomains = universities.map(u => u.domain);
  if (!isValidUniversityEmail(email, allowedDomains)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid university email domain' 
    });
  }

  try {
  // Check if user exists
  const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please sign up first.' 
      });
    }

    // Check if user is email verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email not verified. Please complete email verification first.' 
      });
    }

    return res.json({
      success: true,
      message: 'User exists and can proceed with login',
      user: {
        id: user.id,
        email: user.email,
        isProfileComplete: user.isProfileComplete
      }
    });
  } catch (error) {
    console.error('Error checking user existence:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const sendOtpController = async (req: Request, res: Response) => {
  const { email, isLogin = false } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  // Get allowed university domains
  const universities = await University.find();
  const allowedDomains = universities.map(u => u.domain);
  if (!isValidUniversityEmail(email, allowedDomains)) {
    return res.status(400).json({ success: false, message: 'Invalid university email domain' });
  }

  try {
    // For login flow, check if user exists first
    if (isLogin) {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found. Please sign up first.' 
        });
      }
      
      if (!existingUser.isEmailVerified) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email not verified. Please complete email verification first.' 
        });
      }
    }

    const { otp, expiresIn } = await sendOtp(email);
    await sendEmail(email, 'Your OTP Code', `Your OTP is: ${otp}`);
    
    // Only upsert user for signup flow, not for login
    if (!isLogin) {
      await User.findOneAndUpdate({ email }, { email }, { upsert: true, new: true });
    }
    
    return res.json({ success: true, message: 'OTP sent successfully', expiresIn });
  } catch (err: any) {
    const message = err?.message || 'Unknown error';
    const isRateLimit = message.includes('recently sent') || message.includes('Maximum OTP attempts');
    const status = isRateLimit ? 429 : 500;
    return res.status(status).json({ success: false, message: isRateLimit ? message : 'Failed to send OTP' });
  }
};

export const verifyOtpController = async (req: Request, res: Response) => {
  const { email, otp, isLogin = false, rememberDevice = false } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const valid = await verifyOtp(email, otp);
  if (!valid) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

  // For signup flow, mark email as verified
  if (!isLogin) {
    user.isEmailVerified = true;
    user.otpAttempts = 0;
    await user.save();
  }

  // Issue short-lived access token and 7-day refresh token
  const accessToken = jwt.sign(
    {
      sub: user.id,
      username: user.email.split('@')[0],
      role: 'USER',
      email: user.email
    }, 
    process.env.JWT_SECRET || 'secret', 
    { expiresIn: process.env.ACCESS_TOKEN_TTL || '30m' } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    {
      sub: user.id,
      tokenType: 'refresh'
    }, 
    process.env.JWT_SECRET || 'secret', 
    { expiresIn: process.env.REFRESH_TOKEN_TTL || '7d' } as jwt.SignOptions
  );

  const cookieDomain = process.env.COOKIE_DOMAIN || undefined; // e.g., .yourdomain.com
  const secureCookie = (process.env.COOKIE_SECURE || '').toLowerCase() === 'true' || process.env.NODE_ENV === 'production';
  const commonCookieOpts = {
    httpOnly: true as const,
    secure: secureCookie,
    sameSite: ('lax' as const),
    domain: cookieDomain,
    path: '/'
  };

  // Set refresh token cookie (7 days)
  res.cookie('refresh_token', refreshToken, {
    ...commonCookieOpts,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  // Optionally set trusted-device cookie to bypass OTP on this device
  if (rememberDevice) {
    const otpTrust = jwt.sign({ sub: user.id, tokenType: 'otp_trust' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.cookie('otp_trust', otpTrust, {
      ...commonCookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }

  return res.json({
    success: true,
    tokens: { accessToken, refreshToken },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      universityId: user.universityId,
      degree: user.degree,
      year: user.year,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      skills: user.skills,
      friends: user.friends,
      aboutMe: user.aboutMe,
      sports: user.sports,
      movies: user.movies,
      tvShows: user.tvShows,
      teams: user.teams,
      portfolioLink: user.portfolioLink,
      phoneNumber: user.phoneNumber,
      isProfileComplete: user.isProfileComplete,
      isEmailVerified: user.isEmailVerified,
    },
  });
};

export const refreshTokenController = async (req: Request, res: Response) => {
  // Prefer cookie; fallback to body for backward compatibility
  const rtFromCookie = (req as any).cookies?.refresh_token;
  const rtFromBody = (req.body && req.body.refreshToken) || undefined;
  const refreshToken = rtFromCookie || rtFromBody;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret') as any;
    if (decoded?.tokenType && decoded.tokenType !== 'refresh') {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Rotate refresh token and issue new short-lived access token
    const newAccessToken = jwt.sign(
      {
        sub: user.id,
        username: user.email.split('@')[0],
        role: 'USER',
        email: user.email
      }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: process.env.ACCESS_TOKEN_TTL || '30m' } as jwt.SignOptions
    );

    const newRefreshToken = jwt.sign(
      { sub: user.id, tokenType: 'refresh' }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: process.env.REFRESH_TOKEN_TTL || '7d' } as jwt.SignOptions
    );

    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
    const secureCookie = (process.env.COOKIE_SECURE || '').toLowerCase() === 'true' || process.env.NODE_ENV === 'production';
    const commonCookieOpts = {
      httpOnly: true as const,
      secure: secureCookie,
      sameSite: ('lax' as const),
      domain: cookieDomain,
      path: '/'
    };

    res.cookie('refresh_token', newRefreshToken, {
      ...commonCookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      tokens: { accessToken: newAccessToken },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// Logout endpoint
export const logoutController = async (req: Request, res: Response) => {
  try {
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
    const secureCookie = (process.env.COOKIE_SECURE || '').toLowerCase() === 'true' || process.env.NODE_ENV === 'production';
    const clearOpts = {
      httpOnly: true as const,
      secure: secureCookie,
      sameSite: ('lax' as const),
      domain: cookieDomain,
      path: '/'
    };

    res.clearCookie('refresh_token', clearOpts);
    res.clearCookie('otp_trust', clearOpts);

    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to logout' 
    });
  }
};













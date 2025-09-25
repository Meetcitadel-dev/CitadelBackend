import redisClient, { isRedisAvailable, safeRedisCommand } from '../config/redis';

const OTP_TTL = 300; // 5 minutes (OTP code validity)
const OTP_ATTEMPT_LIMIT = 20; // 20 attempts per 5 hours (reasonable for production)
const OTP_ATTEMPT_WINDOW = 60 * 60 * 5; // 5 hours in seconds
const OTP_RATE_LIMIT = 60; // 1 minute (rate limit between requests)

function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
}

export async function sendOtp(email: string): Promise<{ otp: string; expiresIn: number }> {
  const otpKey = `otp:${email}`;
  const rateKey = `otp_rate:${email}`;
  const attemptsKey = `otp_attempts:${email}`;
  const windowStartKey = `otp_window_start:${email}`;

  // Check if Redis is available
  if (!isRedisAvailable()) {
    console.warn('Redis unavailable, proceeding with basic OTP generation (no rate limiting)');
    const otp = generateOtp();
    return { otp, expiresIn: OTP_TTL };
  }

  try {
    // Rate limiting (1 per minute)
    const rate = await safeRedisCommand(() => redisClient.get(rateKey));
    if (rate) throw new Error('OTP recently sent. Please wait before requesting again.');

    // Check if we need to reset the window
    const windowStart = await safeRedisCommand(() => redisClient.get(windowStartKey));
    const currentTime = Math.floor(Date.now() / 1000);
    
    let attempts = 0;
    if (windowStart) {
      const windowAge = currentTime - parseInt(windowStart, 10);
      if (windowAge >= OTP_ATTEMPT_WINDOW) {
        // Window has expired, reset everything
        await safeRedisCommand(() => redisClient.del(attemptsKey));
        await safeRedisCommand(() => redisClient.del(windowStartKey));
      } else {
        // Window is still active, get current attempts
        const attemptsStr = await safeRedisCommand(() => redisClient.get(attemptsKey));
        attempts = parseInt(attemptsStr || '0', 10);
      }
    }

    // Check attempt limit
    if (attempts >= OTP_ATTEMPT_LIMIT) {
      const remainingTime = OTP_ATTEMPT_WINDOW - (currentTime - parseInt(windowStart || '0', 10));
      const remainingHours = Math.ceil(remainingTime / 3600);
      throw new Error(`Maximum OTP attempts reached. Please try again after ${remainingHours} hours.`);
    }

    const otp = generateOtp();
    
    // Store OTP and rate limit with fallback
    await safeRedisCommand(() => redisClient.setEx(otpKey, OTP_TTL, otp));
    await safeRedisCommand(() => redisClient.setEx(rateKey, OTP_RATE_LIMIT, '1'));
    
    // Set or update window start and attempts
    if (!windowStart || currentTime - parseInt(windowStart, 10) >= OTP_ATTEMPT_WINDOW) {
      // Start new window
      await safeRedisCommand(() => redisClient.setEx(windowStartKey, OTP_ATTEMPT_WINDOW, currentTime.toString()));
      await safeRedisCommand(() => redisClient.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1'));
    } else {
      // Increment attempts in existing window
      await safeRedisCommand(() => redisClient.setEx(attemptsKey, OTP_ATTEMPT_WINDOW - (currentTime - parseInt(windowStart, 10)), (attempts + 1).toString()));
    }

    return { otp, expiresIn: OTP_TTL };
  } catch (error) {
    // If Redis operations fail, still generate OTP but log the issue
    console.error('Redis operations failed during OTP generation:', error);
    const otp = generateOtp();
    console.warn('Generated OTP without Redis tracking - rate limiting disabled');
    return { otp, expiresIn: OTP_TTL };
  }
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const otpKey = `otp:${email}`;
  const attemptsKey = `otp_attempts:${email}`;
  const windowStartKey = `otp_window_start:${email}`;
  
  // Check if Redis is available
  if (!isRedisAvailable()) {
    console.warn('Redis unavailable, OTP verification will always fail for security');
    return false;
  }

  try {
    const storedOtp = await safeRedisCommand(() => redisClient.get(otpKey));
    if (!storedOtp) return false;
    
    if (storedOtp !== otp) {
      // Check if window has expired before incrementing
      const windowStart = await safeRedisCommand(() => redisClient.get(windowStartKey));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (windowStart) {
        const windowAge = currentTime - parseInt(windowStart, 10);
        if (windowAge >= OTP_ATTEMPT_WINDOW) {
          // Window expired, reset and start new window
          await safeRedisCommand(() => redisClient.setEx(windowStartKey, OTP_ATTEMPT_WINDOW, currentTime.toString()));
          await safeRedisCommand(() => redisClient.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1'));
        } else {
          // Increment attempts in existing window
          const attemptsStr = await safeRedisCommand(() => redisClient.get(attemptsKey));
          const attempts = parseInt(attemptsStr || '0', 10);
          await safeRedisCommand(() => redisClient.setEx(attemptsKey, OTP_ATTEMPT_WINDOW - windowAge, (attempts + 1).toString()));
        }
      } else {
        // No window exists, start new one
        await safeRedisCommand(() => redisClient.setEx(windowStartKey, OTP_ATTEMPT_WINDOW, currentTime.toString()));
        await safeRedisCommand(() => redisClient.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1'));
      }
      return false;
    }
    
    // Success: clear OTP (but keep attempts for window)
    await safeRedisCommand(() => redisClient.del(otpKey));
    return true;
  } catch (error) {
    console.error('Redis operations failed during OTP verification:', error);
    // For security, fail verification if Redis is down
    return false;
  }
}












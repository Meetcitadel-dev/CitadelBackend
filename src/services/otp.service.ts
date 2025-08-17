import redisClient from '../config/redis';

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

  // Rate limiting (1 per minute)
  const rate = await redisClient.get(rateKey);
  if (rate) throw new Error('OTP recently sent. Please wait before requesting again.');

  // Check if we need to reset the window
  const windowStart = await redisClient.get(windowStartKey);
  const currentTime = Math.floor(Date.now() / 1000);
  
  let attempts = 0;
  if (windowStart) {
    const windowAge = currentTime - parseInt(windowStart, 10);
    if (windowAge >= OTP_ATTEMPT_WINDOW) {
      // Window has expired, reset everything
      await redisClient.del(attemptsKey);
      await redisClient.del(windowStartKey);
    } else {
      // Window is still active, get current attempts
      attempts = parseInt((await redisClient.get(attemptsKey)) || '0', 10);
    }
  }

  // Check attempt limit
  if (attempts >= OTP_ATTEMPT_LIMIT) {
    const remainingTime = OTP_ATTEMPT_WINDOW - (currentTime - parseInt(windowStart || '0', 10));
    const remainingHours = Math.ceil(remainingTime / 3600);
    throw new Error(`Maximum OTP attempts reached. Please try again after ${remainingHours} hours.`);
  }

  const otp = generateOtp();
  await redisClient.setEx(otpKey, OTP_TTL, otp);
  await redisClient.setEx(rateKey, OTP_RATE_LIMIT, '1');
  
  // Set or update window start and attempts
  if (!windowStart || currentTime - parseInt(windowStart, 10) >= OTP_ATTEMPT_WINDOW) {
    // Start new window
    await redisClient.setEx(windowStartKey, OTP_ATTEMPT_WINDOW, currentTime.toString());
    await redisClient.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1');
  } else {
    // Increment attempts in existing window
    await redisClient.setEx(attemptsKey, OTP_ATTEMPT_WINDOW - (currentTime - parseInt(windowStart, 10)), (attempts + 1).toString());
  }

  return { otp, expiresIn: OTP_TTL };
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const otpKey = `otp:${email}`;
  const attemptsKey = `otp_attempts:${email}`;
  const windowStartKey = `otp_window_start:${email}`;
  
  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp) return false;
  
  if (storedOtp !== otp) {
    // Check if window has expired before incrementing
    const windowStart = await redisClient.get(windowStartKey);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (windowStart) {
      const windowAge = currentTime - parseInt(windowStart, 10);
      if (windowAge >= OTP_ATTEMPT_WINDOW) {
        // Window expired, reset and start new window
        await redisClient.setEx(windowStartKey, OTP_ATTEMPT_WINDOW, currentTime.toString());
        await redisClient.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1');
      } else {
        // Increment attempts in existing window
        const attempts = parseInt((await redisClient.get(attemptsKey)) || '0', 10);
        await redisClient.setEx(attemptsKey, OTP_ATTEMPT_WINDOW - windowAge, (attempts + 1).toString());
      }
    } else {
      // No window exists, start new one
      await redisClient.setEx(windowStartKey, OTP_ATTEMPT_WINDOW, currentTime.toString());
      await redisClient.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1');
    }
    return false;
  }
  
  // Success: clear OTP (but keep attempts for window)
  await redisClient.del(otpKey);
  return true;
}












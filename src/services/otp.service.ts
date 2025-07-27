import redisClient from '../config/redis';

const OTP_TTL = 300; // 5 minutes (OTP code validity)
const OTP_ATTEMPT_LIMIT = 20;
const OTP_ATTEMPT_WINDOW = 60 * 60 * 5; // 5 hours in seconds
const OTP_RATE_LIMIT = 60; // 1 minute (rate limit between requests)

function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
}

export async function sendOtp(email: string): Promise<{ otp: string; expiresIn: number }> {
  const otpKey = `otp:${email}`;
  const rateKey = `otp_rate:${email}`;
  const attemptsKey = `otp_attempts:${email}`;

  // Rate limiting (1 per minute)
  const rate = await redisClient.get(rateKey);
  if (rate) throw new Error('OTP recently sent. Please wait before requesting again.');

  // Attempt limit (5 per 5 hours)
  const attempts = parseInt((await redisClient.get(attemptsKey)) || '0', 10);
  if (attempts >= OTP_ATTEMPT_LIMIT) throw new Error('Maximum OTP attempts reached. Please try again after 5 hours.');

  const otp = generateOtp();
  await redisClient.setEx(otpKey, OTP_TTL, otp);
  await redisClient.setEx(rateKey, OTP_RATE_LIMIT, '1');
  if (attempts === 0) {
    // Set window for attempts if first attempt in window
    await redisClient.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1');
  } else {
    await redisClient.set(attemptsKey, (attempts + 1).toString());
  }

  return { otp, expiresIn: OTP_TTL };
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const otpKey = `otp:${email}`;
  const attemptsKey = `otp_attempts:${email}`;
  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp) return false;
  if (storedOtp !== otp) {
    // Increment attempts (but do not reset window)
    const attempts = parseInt((await redisClient.get(attemptsKey)) || '0', 10);
    await redisClient.set(attemptsKey, (attempts + 1).toString());
    return false;
  }
  // Success: clear OTP (but keep attempts for window)
  await redisClient.del(otpKey);
  return true;
}












import redisClient from '../config/redis';

const OTP_TTL = 300; // 5 minutes
const OTP_ATTEMPT_LIMIT = 3;
const OTP_RATE_LIMIT = 60; // 1 minute

function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
}

export async function sendOtp(email: string): Promise<{ otp: string; expiresIn: number }> {
  const otpKey = `otp:${email}`;
  const rateKey = `otp_rate:${email}`;
  const attemptsKey = `otp_attempts:${email}`;

  // Rate limiting
  const rate = await redisClient.get(rateKey);
  if (rate) throw new Error('OTP recently sent. Please wait before requesting again.');

  // Attempt limit
  const attempts = parseInt((await redisClient.get(attemptsKey)) || '0', 10);
  if (attempts >= OTP_ATTEMPT_LIMIT) throw new Error('Maximum OTP attempts reached.');

  const otp = generateOtp();
  await redisClient.setEx(otpKey, OTP_TTL, otp);
  await redisClient.setEx(rateKey, OTP_RATE_LIMIT, '1');
  await redisClient.set(attemptsKey, (attempts + 1).toString());
  await redisClient.expire(attemptsKey, OTP_TTL);

  return { otp, expiresIn: OTP_TTL };
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const otpKey = `otp:${email}`;
  const attemptsKey = `otp_attempts:${email}`;
  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp) return false;
  if (storedOtp !== otp) {
    // Increment attempts
    const attempts = parseInt((await redisClient.get(attemptsKey)) || '0', 10);
    await redisClient.set(attemptsKey, (attempts + 1).toString());
    await redisClient.expire(attemptsKey, OTP_TTL);
    return false;
  }
  // Success: clear OTP and attempts
  await redisClient.del(otpKey);
  await redisClient.del(attemptsKey);
  return true;
}












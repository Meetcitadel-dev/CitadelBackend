"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtp = sendOtp;
exports.verifyOtp = verifyOtp;
const redis_1 = __importDefault(require("../config/redis"));
const OTP_TTL = 300; // 5 minutes (OTP code validity)
const OTP_ATTEMPT_LIMIT = 100; // Increased from 20 to 100 for testing
const OTP_ATTEMPT_WINDOW = 60 * 60 * 5; // 5 hours in seconds
const OTP_RATE_LIMIT = 60; // 1 minute (rate limit between requests)
function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
}
async function sendOtp(email) {
    const otpKey = `otp:${email}`;
    const rateKey = `otp_rate:${email}`;
    const attemptsKey = `otp_attempts:${email}`;
    // Rate limiting (1 per minute)
    const rate = await redis_1.default.get(rateKey);
    if (rate)
        throw new Error('OTP recently sent. Please wait before requesting again.');
    // Attempt limit (5 per 5 hours)
    const attempts = parseInt((await redis_1.default.get(attemptsKey)) || '0', 10);
    if (attempts >= OTP_ATTEMPT_LIMIT)
        throw new Error('Maximum OTP attempts reached. Please try again after 5 hours.');
    const otp = generateOtp();
    await redis_1.default.setEx(otpKey, OTP_TTL, otp);
    await redis_1.default.setEx(rateKey, OTP_RATE_LIMIT, '1');
    if (attempts === 0) {
        // Set window for attempts if first attempt in window
        await redis_1.default.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1');
    }
    else {
        await redis_1.default.set(attemptsKey, (attempts + 1).toString());
    }
    return { otp, expiresIn: OTP_TTL };
}
async function verifyOtp(email, otp) {
    const otpKey = `otp:${email}`;
    const attemptsKey = `otp_attempts:${email}`;
    const storedOtp = await redis_1.default.get(otpKey);
    if (!storedOtp)
        return false;
    if (storedOtp !== otp) {
        // Increment attempts (but do not reset window)
        const attempts = parseInt((await redis_1.default.get(attemptsKey)) || '0', 10);
        await redis_1.default.set(attemptsKey, (attempts + 1).toString());
        return false;
    }
    // Success: clear OTP (but keep attempts for window)
    await redis_1.default.del(otpKey);
    return true;
}

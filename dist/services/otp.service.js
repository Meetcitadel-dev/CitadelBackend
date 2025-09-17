"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtp = sendOtp;
exports.verifyOtp = verifyOtp;
const redis_1 = __importDefault(require("../config/redis"));
const OTP_TTL = 300; // 5 minutes (OTP code validity)
const OTP_ATTEMPT_LIMIT = 20; // 20 attempts per 5 hours (reasonable for production)
const OTP_ATTEMPT_WINDOW = 60 * 60 * 5; // 5 hours in seconds
const OTP_RATE_LIMIT = 60; // 1 minute (rate limit between requests)
function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
}
async function sendOtp(email) {
    const otpKey = `otp:${email}`;
    const rateKey = `otp_rate:${email}`;
    const attemptsKey = `otp_attempts:${email}`;
    const windowStartKey = `otp_window_start:${email}`;
    // Rate limiting (1 per minute)
    const rate = await redis_1.default.get(rateKey);
    if (rate)
        throw new Error('OTP recently sent. Please wait before requesting again.');
    // Check if we need to reset the window
    const windowStart = await redis_1.default.get(windowStartKey);
    const currentTime = Math.floor(Date.now() / 1000);
    let attempts = 0;
    if (windowStart) {
        const windowAge = currentTime - parseInt(windowStart, 10);
        if (windowAge >= OTP_ATTEMPT_WINDOW) {
            // Window has expired, reset everything
            await redis_1.default.del(attemptsKey);
            await redis_1.default.del(windowStartKey);
        }
        else {
            // Window is still active, get current attempts
            attempts = parseInt((await redis_1.default.get(attemptsKey)) || '0', 10);
        }
    }
    // Check attempt limit
    if (attempts >= OTP_ATTEMPT_LIMIT) {
        const remainingTime = OTP_ATTEMPT_WINDOW - (currentTime - parseInt(windowStart || '0', 10));
        const remainingHours = Math.ceil(remainingTime / 3600);
        throw new Error(`Maximum OTP attempts reached. Please try again after ${remainingHours} hours.`);
    }
    const otp = generateOtp();
    await redis_1.default.setEx(otpKey, OTP_TTL, otp);
    await redis_1.default.setEx(rateKey, OTP_RATE_LIMIT, '1');
    // Set or update window start and attempts
    if (!windowStart || currentTime - parseInt(windowStart, 10) >= OTP_ATTEMPT_WINDOW) {
        // Start new window
        await redis_1.default.setEx(windowStartKey, OTP_ATTEMPT_WINDOW, currentTime.toString());
        await redis_1.default.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1');
    }
    else {
        // Increment attempts in existing window
        await redis_1.default.setEx(attemptsKey, OTP_ATTEMPT_WINDOW - (currentTime - parseInt(windowStart, 10)), (attempts + 1).toString());
    }
    return { otp, expiresIn: OTP_TTL };
}
async function verifyOtp(email, otp) {
    const otpKey = `otp:${email}`;
    const attemptsKey = `otp_attempts:${email}`;
    const windowStartKey = `otp_window_start:${email}`;
    const storedOtp = await redis_1.default.get(otpKey);
    if (!storedOtp)
        return false;
    if (storedOtp !== otp) {
        // Check if window has expired before incrementing
        const windowStart = await redis_1.default.get(windowStartKey);
        const currentTime = Math.floor(Date.now() / 1000);
        if (windowStart) {
            const windowAge = currentTime - parseInt(windowStart, 10);
            if (windowAge >= OTP_ATTEMPT_WINDOW) {
                // Window expired, reset and start new window
                await redis_1.default.setEx(windowStartKey, OTP_ATTEMPT_WINDOW, currentTime.toString());
                await redis_1.default.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1');
            }
            else {
                // Increment attempts in existing window
                const attempts = parseInt((await redis_1.default.get(attemptsKey)) || '0', 10);
                await redis_1.default.setEx(attemptsKey, OTP_ATTEMPT_WINDOW - windowAge, (attempts + 1).toString());
            }
        }
        else {
            // No window exists, start new one
            await redis_1.default.setEx(windowStartKey, OTP_ATTEMPT_WINDOW, currentTime.toString());
            await redis_1.default.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1');
        }
        return false;
    }
    // Success: clear OTP (but keep attempts for window)
    await redis_1.default.del(otpKey);
    return true;
}

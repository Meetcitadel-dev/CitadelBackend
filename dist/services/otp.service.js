"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtp = sendOtp;
exports.verifyOtp = verifyOtp;
const redis_1 = __importStar(require("../config/redis"));
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
    // Check if Redis is available
    if (!(0, redis_1.isRedisAvailable)()) {
        console.warn('Redis unavailable, proceeding with basic OTP generation (no rate limiting)');
        const otp = generateOtp();
        return { otp, expiresIn: OTP_TTL };
    }
    try {
        // Rate limiting (1 per minute)
        const rate = await (0, redis_1.safeRedisCommand)(() => redis_1.default.get(rateKey));
        if (rate)
            throw new Error('OTP recently sent. Please wait before requesting again.');
        // Check if we need to reset the window
        const windowStart = await (0, redis_1.safeRedisCommand)(() => redis_1.default.get(windowStartKey));
        const currentTime = Math.floor(Date.now() / 1000);
        let attempts = 0;
        if (windowStart) {
            const windowAge = currentTime - parseInt(windowStart, 10);
            if (windowAge >= OTP_ATTEMPT_WINDOW) {
                // Window has expired, reset everything
                await (0, redis_1.safeRedisCommand)(() => redis_1.default.del(attemptsKey));
                await (0, redis_1.safeRedisCommand)(() => redis_1.default.del(windowStartKey));
            }
            else {
                // Window is still active, get current attempts
                const attemptsStr = await (0, redis_1.safeRedisCommand)(() => redis_1.default.get(attemptsKey));
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
        await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(otpKey, OTP_TTL, otp));
        await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(rateKey, OTP_RATE_LIMIT, '1'));
        // Set or update window start and attempts
        if (!windowStart || currentTime - parseInt(windowStart, 10) >= OTP_ATTEMPT_WINDOW) {
            // Start new window
            await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(windowStartKey, OTP_ATTEMPT_WINDOW, currentTime.toString()));
            await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1'));
        }
        else {
            // Increment attempts in existing window
            await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(attemptsKey, OTP_ATTEMPT_WINDOW - (currentTime - parseInt(windowStart, 10)), (attempts + 1).toString()));
        }
        return { otp, expiresIn: OTP_TTL };
    }
    catch (error) {
        // If Redis operations fail, still generate OTP but log the issue
        console.error('Redis operations failed during OTP generation:', error);
        const otp = generateOtp();
        console.warn('Generated OTP without Redis tracking - rate limiting disabled');
        return { otp, expiresIn: OTP_TTL };
    }
}
async function verifyOtp(email, otp) {
    const otpKey = `otp:${email}`;
    const attemptsKey = `otp_attempts:${email}`;
    const windowStartKey = `otp_window_start:${email}`;
    // Check if Redis is available
    if (!(0, redis_1.isRedisAvailable)()) {
        console.warn('Redis unavailable, OTP verification will always fail for security');
        return false;
    }
    try {
        const storedOtp = await (0, redis_1.safeRedisCommand)(() => redis_1.default.get(otpKey));
        if (!storedOtp)
            return false;
        if (storedOtp !== otp) {
            // Check if window has expired before incrementing
            const windowStart = await (0, redis_1.safeRedisCommand)(() => redis_1.default.get(windowStartKey));
            const currentTime = Math.floor(Date.now() / 1000);
            if (windowStart) {
                const windowAge = currentTime - parseInt(windowStart, 10);
                if (windowAge >= OTP_ATTEMPT_WINDOW) {
                    // Window expired, reset and start new window
                    await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(windowStartKey, OTP_ATTEMPT_WINDOW, currentTime.toString()));
                    await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1'));
                }
                else {
                    // Increment attempts in existing window
                    const attemptsStr = await (0, redis_1.safeRedisCommand)(() => redis_1.default.get(attemptsKey));
                    const attempts = parseInt(attemptsStr || '0', 10);
                    await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(attemptsKey, OTP_ATTEMPT_WINDOW - windowAge, (attempts + 1).toString()));
                }
            }
            else {
                // No window exists, start new one
                await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(windowStartKey, OTP_ATTEMPT_WINDOW, currentTime.toString()));
                await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(attemptsKey, OTP_ATTEMPT_WINDOW, '1'));
            }
            return false;
        }
        // Success: clear OTP (but keep attempts for window)
        await (0, redis_1.safeRedisCommand)(() => redis_1.default.del(otpKey));
        return true;
    }
    catch (error) {
        console.error('Redis operations failed during OTP verification:', error);
        // For security, fail verification if Redis is down
        return false;
    }
}

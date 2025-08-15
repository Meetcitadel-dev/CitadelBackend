"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpRateLimit = otpRateLimit;
const redis_1 = __importDefault(require("../config/redis"));
async function otpRateLimit(req, res, next) {
    const email = req.body.email;
    if (!email)
        return res.status(400).json({ success: false, message: 'Email is required for rate limiting' });
    const key = `otp_rate_limit:${email}`;
    const exists = await redis_1.default.get(key);
    if (exists) {
        return res.status(429).json({ success: false, message: 'Too many requests. Please wait before retrying.' });
    }
    await redis_1.default.setEx(key, 60, '1'); // 1 minute TTL
    next();
}

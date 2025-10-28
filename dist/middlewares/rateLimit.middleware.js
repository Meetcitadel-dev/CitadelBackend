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
exports.otpRateLimit = otpRateLimit;
const redis_1 = __importStar(require("../config/redis"));
async function otpRateLimit(req, res, next) {
    const email = req.body.email;
    if (!email)
        return res.status(400).json({ success: false, message: 'Email is required for rate limiting' });
    const key = `otp_rate_limit:${email}`;
    try {
        if (!(0, redis_1.isRedisAvailable)()) {
            console.warn('Redis unavailable in otpRateLimit; allowing request without Redis rate limit');
            return next();
        }
        const exists = await (0, redis_1.safeRedisCommand)(() => redis_1.default.get(key));
        if (exists) {
            return res.status(429).json({ success: false, message: 'Too many requests. Please wait before retrying.' });
        }
        await (0, redis_1.safeRedisCommand)(() => redis_1.default.setEx(key, 60, '1'));
        return next();
    }
    catch (err) {
        console.error('otpRateLimit encountered an error; bypassing rate limit:', err);
        return next();
    }
}

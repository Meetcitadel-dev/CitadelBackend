"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRedisAvailable = isRedisAvailable;
exports.safeRedisCommand = safeRedisCommand;
const redis_1 = require("redis");
// Enhanced Redis configuration with proper timeout and retry settings
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        connectTimeout: 10000, // 10 seconds
        reconnectStrategy: (retries) => {
            if (retries > 3) {
                console.error('Redis: Max reconnection attempts reached');
                return false; // Stop trying to reconnect
            }
            return Math.min(retries * 100, 3000); // Exponential backoff
        }
    }
});
let isConnected = false;
let connectionPromise = null;
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
    isConnected = false;
});
redisClient.on('connect', () => {
    console.log('Redis: Connected successfully');
    isConnected = true;
});
redisClient.on('ready', () => {
    console.log('Redis: Ready to accept commands');
    isConnected = true;
});
redisClient.on('end', () => {
    console.log('Redis: Connection ended');
    isConnected = false;
});
// Connection function with retry logic
async function connectRedis() {
    if (connectionPromise) {
        return connectionPromise;
    }
    connectionPromise = (async () => {
        try {
            if (!redisClient.isOpen) {
                await redisClient.connect();
                isConnected = true;
            }
        }
        catch (error) {
            console.error('Redis: Failed to connect:', error);
            isConnected = false;
            connectionPromise = null; // Reset so we can try again
            throw error;
        }
    })();
    return connectionPromise;
}
// Initialize connection
connectRedis().catch(err => {
    console.error('Redis: Initial connection failed:', err);
});
// Helper function to check if Redis is available
function isRedisAvailable() {
    return isConnected && redisClient.isOpen;
}
// Helper function to safely execute Redis commands with fallback
async function safeRedisCommand(command, fallback) {
    try {
        if (!isRedisAvailable()) {
            await connectRedis();
        }
        return await command();
    }
    catch (error) {
        console.error('Redis command failed:', error);
        isConnected = false;
        return fallback;
    }
}
exports.default = redisClient;

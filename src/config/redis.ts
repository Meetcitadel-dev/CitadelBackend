import { Redis } from '@upstash/redis';
import { createClient } from 'redis';

// Upstash Redis configuration
const upstashRedisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://normal-leopard-11319.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'ASw3AAIncDI2OWY2ZTQ0YzM2OTU0MjlkOTc4ZjQxMjRjOWFiYWY2NXAyMTEzMTk',
});

// Fallback traditional Redis client for backward compatibility
const traditionalRedisClient = createClient({
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
let connectionPromise: Promise<void> | null = null;
let useUpstash = true; // Default to Upstash

// Traditional Redis event handlers (only used as fallback)
traditionalRedisClient.on('error', (err) => {
  console.error('Traditional Redis Client Error:', err);
  if (!useUpstash) {
    isConnected = false;
  }
});

traditionalRedisClient.on('connect', () => {
  console.log('Traditional Redis: Connected successfully');
  if (!useUpstash) {
    isConnected = true;
  }
});

traditionalRedisClient.on('ready', () => {
  console.log('Traditional Redis: Ready to accept commands');
  if (!useUpstash) {
    isConnected = true;
  }
});

traditionalRedisClient.on('end', () => {
  console.log('Traditional Redis: Connection ended');
  if (!useUpstash) {
    isConnected = false;
  }
});

// Test Upstash Redis connection
async function testUpstashConnection(): Promise<boolean> {
  try {
    await upstashRedisClient.ping();
    console.log('✅ Upstash Redis: Connection successful');
    return true;
  } catch (error) {
    console.error('❌ Upstash Redis: Connection failed:', error);
    return false;
  }
}

// Connection function with fallback logic
async function connectRedis(): Promise<void> {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      // First, try Upstash Redis
      const upstashWorking = await testUpstashConnection();
      if (upstashWorking) {
        useUpstash = true;
        isConnected = true;
        console.log('✅ Using Upstash Redis');
        return;
      }

      // Fallback to traditional Redis
      console.log('⚠️ Upstash Redis failed, falling back to traditional Redis');
      useUpstash = false;
      if (!traditionalRedisClient.isOpen) {
        await traditionalRedisClient.connect();
        isConnected = true;
        console.log('✅ Using traditional Redis');
      }
    } catch (error) {
      console.error('❌ All Redis connections failed:', error);
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
export function isRedisAvailable(): boolean {
  return isConnected;
}

// Unified Redis interface that works with both Upstash and traditional Redis
const unifiedRedisClient = {
  async get(key: string): Promise<string | null> {
    if (useUpstash) {
      const result = await upstashRedisClient.get(key);
      if (result === null) return null;
      // Upstash may return objects directly, so we need to handle this
      if (typeof result === 'string') {
        return result;
      } else {
        // If it's an object, stringify it to maintain compatibility
        return JSON.stringify(result);
      }
    } else {
      return await traditionalRedisClient.get(key);
    }
  },

  async set(key: string, value: string): Promise<string | null> {
    if (useUpstash) {
      await upstashRedisClient.set(key, value);
      return 'OK';
    } else {
      return await traditionalRedisClient.set(key, value);
    }
  },

  async setEx(key: string, seconds: number, value: string): Promise<string | null> {
    if (useUpstash) {
      await upstashRedisClient.setex(key, seconds, value);
      return 'OK';
    } else {
      return await traditionalRedisClient.setEx(key, seconds, value);
    }
  },

  async del(keys: string | string[]): Promise<number> {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    if (useUpstash) {
      return await upstashRedisClient.del(...keyArray);
    } else {
      return await traditionalRedisClient.del(keyArray);
    }
  },

  async keys(pattern: string): Promise<string[]> {
    if (useUpstash) {
      return await upstashRedisClient.keys(pattern);
    } else {
      return await traditionalRedisClient.keys(pattern);
    }
  },

  async ping(): Promise<string> {
    if (useUpstash) {
      return await upstashRedisClient.ping();
    } else {
      return await traditionalRedisClient.ping();
    }
  },

  // Property to check if using Upstash
  get isUpstash(): boolean {
    return useUpstash;
  }
};

// Helper function to safely execute Redis commands with fallback
export async function safeRedisCommand<T>(
  command: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    if (!isRedisAvailable()) {
      await connectRedis();
    }
    return await command();
  } catch (error) {
    console.error('Redis command failed:', error);
    // Try to reconnect for next time
    isConnected = false;
    connectionPromise = null;
    return fallback;
  }
}

export default unifiedRedisClient;







import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    // Force TLS because Upstash requires it (use rediss:// in REDIS_URL)
    tls: true,
    // Prefer IPv4 to avoid potential IPv6 routing issues on some hosts
    family: 4,
  },
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
})();

export default redisClient;







# Upstash Redis Configuration

This document explains the Upstash Redis integration in the Citadel backend, which provides improved performance and reliability for caching operations.

## Overview

The backend now uses Upstash Redis as the primary caching solution with automatic fallback to traditional Redis if needed. This configuration provides:

- ✅ **Better Performance**: REST-based Redis with global edge locations
- ✅ **Improved Reliability**: Managed service with automatic failover
- ✅ **Easier Deployment**: No need to manage Redis infrastructure
- ✅ **Backward Compatibility**: Seamless fallback to traditional Redis

## Configuration

### Environment Variables

Add these environment variables to your `.env` file:

```bash
# Upstash Redis (Primary)
UPSTASH_REDIS_REST_URL=https://normal-leopard-11319.upstash.io
UPSTASH_REDIS_REST_TOKEN=ASw3AAIncDI2OWY2ZTQ0YzM2OTU0MjlkOTc4ZjQxMjRjOWFiYWY2NXAyMTEzMTk

# Traditional Redis (Fallback)
REDIS_URL=redis://localhost:6379
```

### Package Dependencies

The following package has been added:

```bash
npm install @upstash/redis
```

## How It Works

### Automatic Fallback System

1. **Primary**: Attempts to connect to Upstash Redis using REST API
2. **Fallback**: If Upstash fails, falls back to traditional Redis
3. **Unified Interface**: All Redis operations work the same regardless of which client is used

### Supported Operations

The unified Redis client supports all common operations:

- `get(key)` - Get a value by key
- `set(key, value)` - Set a key-value pair
- `setEx(key, seconds, value)` - Set with expiration
- `del(keys)` - Delete one or more keys
- `keys(pattern)` - Find keys matching a pattern
- `ping()` - Test connection

### Usage in Code

```typescript
import redisClient, { safeRedisCommand } from '../config/redis';

// Safe Redis operation with fallback
const cachedData = await safeRedisCommand(
  () => redisClient.get('my-key'),
  null // fallback value
);

// Direct Redis operation
const result = await redisClient.set('my-key', 'my-value');
```

## Testing

### Test Redis Configuration

```bash
npm run test-redis
```

This will test:
- Connection to Upstash Redis
- Basic operations (get, set, setEx, del, keys)
- JSON serialization/deserialization
- Cache simulation

### Test University API with Redis

```bash
npm run test-university-api
```

This will test:
- University API performance
- Cache hit/miss behavior
- Search functionality
- Response times

## Performance Benefits

### University Loading Improvements

The university dropdown loading issues have been resolved through:

1. **Optimized Database Queries**: Added indexes and improved query patterns
2. **Enhanced Caching**: Upstash Redis provides faster cache operations
3. **Debounced Frontend**: Reduced unnecessary API calls
4. **Better Error Handling**: Graceful fallbacks when cache is unavailable

### Expected Performance Gains

- **First Load**: 200-500ms (database query + cache store)
- **Cached Load**: 50-100ms (cache retrieval only)
- **Search Results**: 100-300ms (optimized database search + cache)

## Monitoring and Debugging

### Check Which Redis Client is Active

```typescript
console.log(`Using Redis client: ${redisClient.isUpstash ? 'Upstash' : 'Traditional'}`);
```

### Redis Connection Status

```typescript
import { isRedisAvailable } from '../config/redis';

if (isRedisAvailable()) {
  console.log('Redis is connected and ready');
} else {
  console.log('Redis is not available');
}
```

### Cache Key Patterns

The application uses these cache key patterns:

- `universities:{search}:{limit}:{offset}` - University search results
- `test:*` - Test keys (automatically cleaned up)

## Troubleshooting

### Common Issues

1. **Upstash Connection Fails**
   - Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   - Verify network connectivity
   - System will automatically fall back to traditional Redis

2. **Traditional Redis Connection Fails**
   - Check `REDIS_URL` configuration
   - Ensure Redis server is running (if using local Redis)
   - Application will continue without caching

3. **Cache Not Working**
   - Run `npm run test-redis` to verify configuration
   - Check application logs for Redis errors
   - Verify environment variables are loaded

### Debug Logging

Enable debug logging by setting:

```bash
DEBUG=redis:*
```

## Migration from Traditional Redis

The migration is seamless:

1. ✅ **No Code Changes Required**: Existing Redis usage continues to work
2. ✅ **Automatic Detection**: System detects and uses Upstash when available
3. ✅ **Graceful Fallback**: Falls back to traditional Redis if needed
4. ✅ **Same API**: All Redis operations use the same interface

## Security

- Upstash Redis uses REST API with token-based authentication
- All connections are encrypted (HTTPS)
- Traditional Redis fallback supports standard Redis AUTH
- No sensitive data is cached (only university lists and search results)

## Next Steps

1. Monitor performance improvements in production
2. Consider migrating other caching operations to use the unified Redis client
3. Implement cache warming strategies for frequently accessed data
4. Add cache metrics and monitoring

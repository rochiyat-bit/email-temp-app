import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = Redis.fromEnv();

export default redis;

/**
 * Cache key helpers
 */
export const CacheKeys = {
  inboxEmails: (accessToken: string) => `inbox:${accessToken}`,
  temporaryEmail: (accessToken: string) => `temp-email:${accessToken}`,
  emailDetail: (emailId: string) => `email:${emailId}`,
  domains: () => 'domains:all',
  emailCount: (emailAddress: string) => `count:${emailAddress}`,
};

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  INBOX_LIST: 300, // 5 minutes
  EMAIL_DETAIL: 600, // 10 minutes
  DOMAINS: 3600, // 1 hour
  TEMPORARY_EMAIL: 7200, // 2 hours
};

/**
 * Get from cache with fallback
 */
export async function getCached<T>(
  key: string,
  fallback: () => Promise<T>,
  ttl: number = CacheTTL.INBOX_LIST
): Promise<T> {
  try {
    const cached = await redis.get<T>(key);
    if (cached) {
      return cached;
    }

    const data = await fallback();
    await redis.setex(key, ttl, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    return fallback();
  }
}

/**
 * Invalidate cache by key or pattern
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Set cache with TTL
 */
export async function setCache(
  key: string,
  value: any,
  ttl: number = CacheTTL.INBOX_LIST
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

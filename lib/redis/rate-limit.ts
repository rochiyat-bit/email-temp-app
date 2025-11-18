import { Ratelimit } from '@upstash/ratelimit';
import redis from './client';

/**
 * Rate limiters for different endpoints
 */

// Email generation: 10 requests per IP per hour
export const emailGenerationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'ratelimit:generate',
});

// Inbox access: 60 requests per token per minute
export const inboxAccessLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: true,
  prefix: 'ratelimit:inbox',
});

// Email viewing: 100 requests per token per minute
export const emailViewLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:view',
});

// Attachment downloads: 50 per token per hour
export const attachmentDownloadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '1 h'),
  analytics: true,
  prefix: 'ratelimit:attachment',
});

// Extension requests: 3 per email lifetime
export const extensionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, '24 h'),
  analytics: true,
  prefix: 'ratelimit:extend',
});

/**
 * Check rate limit and return result
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}

/**
 * Rate limit middleware for API routes
 */
export async function withRateLimit(
  limiter: Ratelimit,
  identifier: string,
  handler: () => Promise<Response>
): Promise<Response> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return Response.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter,
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  const response = await handler();

  // Add rate limit headers to successful responses
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', limit.toString());
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', reset.toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

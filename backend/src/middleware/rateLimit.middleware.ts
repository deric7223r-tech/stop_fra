import { Context, Next } from 'hono';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  keyGenerator?: (c: Context) => string;
}

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getClientIp(c: Context): string {
  const forwardedFor = c.req.header('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = c.req.header('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return (
    (c.req.raw as any)?.socket?.remoteAddress ||
    (c.req.raw as any)?.connection?.remoteAddress ||
    'unknown'
  );
}

export function rateLimit(options: RateLimitOptions) {
  const windowMs = options.windowMs;
  const max = options.max;
  const prefix = options.keyPrefix || 'rl';

  return async (c: Context, next: Next) => {
    const now = Date.now();

    const keyFromFn = options.keyGenerator ? options.keyGenerator(c) : undefined;
    const key = `${prefix}:${keyFromFn || getClientIp(c)}`;

    const existing = buckets.get(key);
    if (!existing || now >= existing.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (existing.count >= max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      c.header('Retry-After', String(retryAfterSeconds));
      return c.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
          },
        },
        429
      );
    }

    existing.count += 1;
    buckets.set(key, existing);

    await next();
  };
}

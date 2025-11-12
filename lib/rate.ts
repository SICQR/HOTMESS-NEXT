// Token bucket rate limiter (in-memory). Suitable for single-instance dev/test.
// For production multi-instance, back with Redis or a durable store.

const buckets = new Map<string, number[]>();

export function rateLimitAllow(key: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) return false;
  arr.push(now);
  buckets.set(key, arr);
  return true;
}

export function resetRateLimiter(key?: string) {
  if (key) buckets.delete(key);
  else buckets.clear();
}

export function checkLimit(key: string, max: number, windowMs: number): boolean {
  return rateLimitAllow(key, max, windowMs);
}

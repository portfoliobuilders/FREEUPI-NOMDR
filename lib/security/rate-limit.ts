export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterMs: number;
}

export interface RateLimiter {
  limit(key: string): Promise<RateLimitResult>;
}

interface Bucket {
  timestamps: number[];
}

/**
 * In-memory sliding-window limiter for a single runtime instance.
 * Swap this implementation for a shared store (for example Upstash Redis)
 * in multi-instance production without changing call sites.
 */
export class MemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  async limit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const bucket = this.buckets.get(key) ?? { timestamps: [] };
    bucket.timestamps = bucket.timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    if (bucket.timestamps.length >= this.maxRequests) {
      const oldest = bucket.timestamps[0] ?? now;
      this.buckets.set(key, bucket);
      return {
        success: false,
        remaining: 0,
        retryAfterMs: this.windowMs - (now - oldest),
      };
    }

    bucket.timestamps.push(now);
    this.buckets.set(key, bucket);
    return {
      success: true,
      remaining: this.maxRequests - bucket.timestamps.length,
      retryAfterMs: 0,
    };
  }
}

export const authRateLimiter = new MemoryRateLimiter(8, 10 * 60 * 1000);
export const invoiceWriteRateLimiter = new MemoryRateLimiter(
  30,
  10 * 60 * 1000,
);

// src/utils/rateLimit.ts

/**
 * Simple token bucket limiter with async acquire + jitter backoff.
 * Each instance controls how many API calls can run per time window.
 *
 * Usage:
 *   const dexLimiter = new TokenBucket({ reservoir: 300, refillIntervalMs: 60_000 });
 *   await dexLimiter.acquire();
 *   await http.get(url);
 *
 * Or wrap functions:
 *   export const fetchDexLimited = rateLimit(fetchDexScreener, { maxPerMinute: 300 });
 */

export class TokenBucket {
  private capacity: number;
  private tokens: number;
  private refillIntervalMs: number;
  private lastRefill: number;

  constructor(opts: { reservoir: number; refillIntervalMs: number }) {
    this.capacity = Math.max(1, opts.reservoir);
    this.tokens = this.capacity;
    this.refillIntervalMs = Math.max(100, opts.refillIntervalMs);
    this.lastRefill = Date.now();
    setInterval(() => this.refill(), this.refillIntervalMs).unref();
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed >= this.refillIntervalMs) {
      this.tokens = this.capacity;
      this.lastRefill = now;
    }
  }

  async acquire(): Promise<void> {
    while (true) {
      this.refill();
      if (this.tokens > 0) {
        this.tokens -= 1;
        return;
      }
      // no tokens available → wait with jitter
      await sleep(50 + Math.random() * 100);
    }
  }
}

/**
 * Exponential backoff helper for retries.
 * Example: await withBackoff(() => http.get(url))
 */
export async function withBackoff<T>(
  fn: () => Promise<T>,
  opts: { maxRetries?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 200 } = opts;
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) throw err;
      const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 100;
      await sleep(delay);
    }
  }
}

/**
 * Higher-order rate limiter for wrapping async functions.
 *
 * Example:
 *   const fetchDexLimited = rateLimit(fetchDexScreener, { maxPerMinute: 300 });
 */
export function rateLimit<F extends (...args: any[]) => Promise<any>>(
  fn: F,
  opts: { maxPerMinute: number }
): F {
  const limiter = new TokenBucket({
    reservoir: opts.maxPerMinute,
    refillIntervalMs: 60_000, // 1 minute
  });
  return (async function (...args: Parameters<F>): Promise<ReturnType<F>> {
    await limiter.acquire();
    return fn(...args);
  }) as F;
}

/** Simple sleep util */
export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

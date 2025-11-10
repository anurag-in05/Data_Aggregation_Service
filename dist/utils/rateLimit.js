"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBucket = void 0;
exports.withBackoff = withBackoff;
exports.rateLimit = rateLimit;
exports.sleep = sleep;
class TokenBucket {
    constructor(opts) {
        this.capacity = Math.max(1, opts.reservoir);
        this.tokens = this.capacity;
        this.refillIntervalMs = Math.max(100, opts.refillIntervalMs);
        this.lastRefill = Date.now();
        setInterval(() => this.refill(), this.refillIntervalMs).unref();
    }
    refill() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        if (elapsed >= this.refillIntervalMs) {
            this.tokens = this.capacity;
            this.lastRefill = now;
        }
    }
    async acquire() {
        while (true) {
            this.refill();
            if (this.tokens > 0) {
                this.tokens -= 1;
                return;
            }
            await sleep(50 + Math.random() * 100);
        }
    }
}
exports.TokenBucket = TokenBucket;
async function withBackoff(fn, opts = {}) {
    const { maxRetries = 3, baseDelayMs = 200 } = opts;
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        }
        catch (err) {
            attempt++;
            if (attempt > maxRetries)
                throw err;
            const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 100;
            await sleep(delay);
        }
    }
}
function rateLimit(fn, opts) {
    const limiter = new TokenBucket({
        reservoir: opts.maxPerMinute,
        refillIntervalMs: 60000,
    });
    return (async function (...args) {
        await limiter.acquire();
        return fn(...args);
    });
}
function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}
//# sourceMappingURL=rateLimit.js.map
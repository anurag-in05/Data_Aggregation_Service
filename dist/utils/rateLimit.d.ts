export declare class TokenBucket {
    private capacity;
    private tokens;
    private refillIntervalMs;
    private lastRefill;
    constructor(opts: {
        reservoir: number;
        refillIntervalMs: number;
    });
    private refill;
    acquire(): Promise<void>;
}
export declare function withBackoff<T>(fn: () => Promise<T>, opts?: {
    maxRetries?: number;
    baseDelayMs?: number;
}): Promise<T>;
export declare function rateLimit<F extends (...args: any[]) => Promise<any>>(fn: F, opts: {
    maxPerMinute: number;
}): F;
export declare function sleep(ms: number): Promise<void>;
//# sourceMappingURL=rateLimit.d.ts.map
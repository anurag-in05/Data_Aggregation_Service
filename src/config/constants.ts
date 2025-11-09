// src/config/constants.ts
export const CONSTANTS = {
  CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS || 30),
  AGG_INTERVAL_MS: Number(process.env.AGG_INTERVAL_MS || 7000),
  RATE_LIMIT_RPM: Number(process.env.RATE_LIMIT_RPM || 300),
  RETRY_MAX_ATTEMPTS: Number(process.env.RETRY_MAX_ATTEMPTS || 4),
  RETRY_BASE_DELAY_MS: Number(process.env.RETRY_BASE_DELAY_MS || 200),

  // Spike detection thresholds (will be used in Phase 5–7)
  SPIKE_PRICE_PCT_1H: Number(process.env.SPIKE_PRICE_PCT_1H || 5),
  SPIKE_VOLUME_MULT: Number(process.env.SPIKE_VOLUME_MULT || 2),

  // Redis key prefixes
  REDIS_PREFIX: "rt:v1",
};

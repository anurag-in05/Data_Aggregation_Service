// src/utils/time.ts
import { Period } from '../domain/types';

export const PERIOD_MS: Record<Period, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
};

export function bucketStart(period: Period, now = Date.now()): number {
  const w = PERIOD_MS[period];
  return Math.floor(now / w) * w;
}

export function inPast(ms: number): number {
  return Date.now() - ms;
}

export function clampTimeToPeriodStart(period: Period, ts: number): number {
  const start = bucketStart(period, ts);
  return start;
}


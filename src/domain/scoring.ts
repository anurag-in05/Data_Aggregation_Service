// src/domain/scoring.ts
import { Period, SortDir, SortKey, TokenUnified } from './types';

export function getPeriodChangeField(period: Period): keyof TokenUnified {
  return period === '1h'
    ? 'price_1h_change'
    : period === '24h'
    ? 'price_24h_change'
    : 'price_7d_change';
}

export function metricValue(
  t: TokenUnified,
  metric: SortKey,
  period: Period
): number {
  switch (metric) {
    case 'price':
      return safeNum(t.price_sol);
    case 'market_cap':
      return safeNum(t.market_cap_sol);
    case 'volume':
      return safeNum(t.volume_sol);
    case 'price_change': {
      const f = getPeriodChangeField(period);
      return safeNum((t as any)[f]);
    }
    default:
      return 0;
  }
}

export function comparator(
  metric: SortKey,
  period: Period,
  dir: SortDir
): (a: TokenUnified, b: TokenUnified) => number {
  const s = dir === 'asc' ? 1 : -1;
  return (a, b) => {
    const av = metricValue(a, metric, period);
    const bv = metricValue(b, metric, period);
    if (av === bv) return a.token_address.localeCompare(b.token_address) * s;
    return av > bv ? 1 * s : -1 * s;
  };
}

function safeNum(n?: number): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

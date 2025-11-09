// src/cache/keys.ts

export const PREFIX = "tokens";

/**
 * 🔹 Key for individual token JSON blob
 * Example → tokens:token:FQ1738Xg5TpXYEXC4Mvnd1U73o49auzoCV3bkVwcpump
 */
export function tokenKey(address: string): string {
  return `${PREFIX}:token:${address}`;
}

/**
 * 🔹 Key for sorted sets by metric + period
 * Example → tokens:zset:24h:volume
 */
export function sortedKey(period: string, metric: string): string {
  return `${PREFIX}:zset:${period}:${metric}`;
}

/**
 * 🔹 Key for snapshots (used for deltas/diffs)
 * Example → tokens:snap:FQ17...:24h
 */
export function snapKey(address: string, period: string): string {
  return `${PREFIX}:snap:${address}:${period}`;
}

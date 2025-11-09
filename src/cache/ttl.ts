// src/cache/ttl.ts

export const DEFAULT_TTL = 30; // seconds

export function ttlSeconds(custom?: number): number {
  return custom && custom > 0 ? custom : DEFAULT_TTL;
}

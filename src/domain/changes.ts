// src/domain/changes.ts
import { FieldDelta, TokenDelta, TokenUnified } from './types';

type DiffOptions = {
  epsilonPricePct?: number;    // ignore noise under this %
  epsilonAbs?: number;         // absolute epsilon for small floats
};

const DEFAULTS: Required<DiffOptions> = {
  epsilonPricePct: 0.001,      // 0.1% price noise guard
  epsilonAbs: 1e-9,
};

export function diffToken(
  prev: TokenUnified | null,
  next: TokenUnified,
  opts: DiffOptions = {}
): TokenDelta | null {
  if (!prev) {
    // first insert → treat as snapshot delta (can be ignored by client if needed)
    return {
      token_address: next.token_address,
      ts: Date.now(),
      changes: {}, // empty snapshot change-set
    };
  }

  // Narrow prev once for all inner closures
  const prevObj = prev as TokenUnified;

  // Merge defaults but also create non-optional locals for TS
  const merged = { ...DEFAULTS, ...opts };
  const epsilonAbs = merged.epsilonAbs;
  const epsilonPct = merged.epsilonPricePct;

  const changes: TokenDelta['changes'] = {};

  function setIfChanged<K extends keyof TokenUnified>(
    key: K,
    cmp: (a: any, b: any) => boolean = (a, b) => a !== b
  ) {
    const oldVal = prevObj[key];
    const newVal = next[key];
    if (cmp(oldVal, newVal)) {
      changes[key] = { old: oldVal as any, new: newVal as any } as FieldDelta;
    }
  }

  // numeric with epsilon guard
  const numChanged = (oldVal?: number, newVal?: number) => {
    const a = typeof oldVal === 'number' ? oldVal : undefined;
    const b = typeof newVal === 'number' ? newVal : undefined;
    if (a === undefined && b === undefined) return false;
    if (a === undefined || b === undefined) return true;
    if (!Number.isFinite(a) || !Number.isFinite(b)) return true;

    const abs = Math.abs(a - b);
    if (abs <= epsilonAbs) return false;

    // percentage noise guard relative to magnitude
    const base = Math.max(Math.abs(a), epsilonAbs);
    const pct = abs / base;
    return pct > epsilonPct;
  };

  const numericKeys: (keyof TokenUnified)[] = [
    'price_sol',
    'market_cap_sol',
    'volume_sol',
    'liquidity_sol',
    'transaction_count',
    'price_1h_change',
    'price_24h_change',
    'price_7d_change',
  ];
  for (const k of numericKeys) setIfChanged(k, numChanged);

  const strKeys: (keyof TokenUnified)[] = ['token_name', 'token_ticker', 'protocol'];
  for (const k of strKeys) setIfChanged(k);

  if (Object.keys(changes).length === 0) return null;
  return { token_address: next.token_address, ts: Date.now(), changes };
}

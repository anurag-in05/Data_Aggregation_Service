// src/domain/types.ts

export type Period = '1h' | '24h' | '7d';

export type SortKey =
  | 'volume'
  | 'price'
  | 'market_cap'
  | 'price_change'; // change for selected period

export type SortDir = 'asc' | 'desc';

export type Filters = {
  q?: string | undefined;             // text search name/ticker
  min_liquidity?: number | undefined; // SOL
  protocol?: string | undefined;      // e.g. 'raydium', 'orca'
};

export interface ListQuery {
  limit: number;
  cursor?: string | null | undefined;
  sort: SortKey;
  dir: SortDir;
  period: Period;
  filters: Filters;
}

/**
 * Unified token shape used by cache / API / WS.
 * Note: With `exactOptionalPropertyTypes: true`, any optional prop that may
 * be assigned `undefined` must explicitly include `| undefined`.
 */
export interface TokenUnified {
  token_address: string;  // canonical mint address (Solana)
  token_name: string;
  token_ticker: string;

  price_sol: number;

  market_cap_sol?: number | undefined;
  volume_sol?: number | undefined;
  liquidity_sol?: number | undefined;
  transaction_count?: number | undefined;

  // precomputed changes; period-specific indexes will use these
  price_1h_change?: number | undefined;   // percentage
  price_24h_change?: number | undefined;
  price_7d_change?: number | undefined;

  protocol?: string | undefined;          // e.g., 'Raydium CLMM'
  last_updated: number;                   // epoch ms
  sources: string[];                      // ['dexscreener','geckoterminal','jupiter']
}

// Per-provider normalized shard
export interface SourceToken {
  source: 'dexscreener' | 'geckoterminal' | 'jupiter';
  token_address: string;                 // canonical mint
  fields: Partial<TokenUnified>;
  raw?: unknown | undefined;             // optional passthrough
  fetched_at: number;                    // epoch ms
}

// For websocket deltas
export interface FieldDelta<T = any> {
  old: T | undefined;
  new: T | undefined;
}

export interface TokenDelta {
  token_address: string;
  changes: Partial<Record<keyof TokenUnified, FieldDelta>>;
  ts: number;
}

export interface PagedResult<T> {
  data: T[];
  next_cursor: string | null;
  ttl: number; // seconds remaining
}

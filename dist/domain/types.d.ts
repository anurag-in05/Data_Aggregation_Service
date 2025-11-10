export type Period = '1h' | '24h' | '7d';
export type SortKey = 'volume' | 'price' | 'market_cap' | 'price_change';
export type SortDir = 'asc' | 'desc';
export type Filters = {
    q?: string | undefined;
    min_liquidity?: number | undefined;
    protocol?: string | undefined;
};
export interface ListQuery {
    limit: number;
    cursor?: string | null | undefined;
    sort: SortKey;
    dir: SortDir;
    period: Period;
    filters: Filters;
}
export interface TokenUnified {
    token_address: string;
    token_name: string;
    token_ticker: string;
    price_sol: number;
    market_cap_sol?: number | undefined;
    volume_sol?: number | undefined;
    liquidity_sol?: number | undefined;
    transaction_count?: number | undefined;
    price_1h_change?: number | undefined;
    price_24h_change?: number | undefined;
    price_7d_change?: number | undefined;
    protocol?: string | undefined;
    last_updated: number;
    sources: string[];
}
export interface SourceToken {
    source: 'dexscreener' | 'geckoterminal' | 'jupiter';
    token_address: string;
    fields: Partial<TokenUnified>;
    raw?: unknown | undefined;
    fetched_at: number;
}
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
    ttl: number;
}
//# sourceMappingURL=types.d.ts.map
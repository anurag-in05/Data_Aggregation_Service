import { TokenUnified, TokenDelta } from "../domain/types";
export declare function upsertToken(token: TokenUnified): Promise<void>;
export declare function listTokens(period: string, metric: string, cursor?: number, limit?: number): Promise<{
    data: TokenUnified[];
    next_cursor: number | null;
    ttl: number;
}>;
export declare function upsertAndDiff(token: TokenUnified): Promise<TokenDelta | null>;
export declare function getTTL(): Promise<number>;
//# sourceMappingURL=repo.d.ts.map
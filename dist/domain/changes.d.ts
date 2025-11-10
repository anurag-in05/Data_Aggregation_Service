import { TokenDelta, TokenUnified } from './types';
type DiffOptions = {
    epsilonPricePct?: number;
    epsilonAbs?: number;
};
export declare function diffToken(prev: TokenUnified | null, next: TokenUnified, opts?: DiffOptions): TokenDelta | null;
export {};
//# sourceMappingURL=changes.d.ts.map
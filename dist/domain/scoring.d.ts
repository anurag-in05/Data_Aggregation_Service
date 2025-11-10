import { Period, SortDir, SortKey, TokenUnified } from './types';
export declare function getPeriodChangeField(period: Period): keyof TokenUnified;
export declare function metricValue(t: TokenUnified, metric: SortKey, period: Period): number;
export declare function comparator(metric: SortKey, period: Period, dir: SortDir): (a: TokenUnified, b: TokenUnified) => number;
//# sourceMappingURL=scoring.d.ts.map
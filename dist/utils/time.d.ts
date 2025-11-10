import { Period } from '../domain/types';
export declare const PERIOD_MS: Record<Period, number>;
export declare function bucketStart(period: Period, now?: number): number;
export declare function inPast(ms: number): number;
export declare function clampTimeToPeriodStart(period: Period, ts: number): number;
//# sourceMappingURL=time.d.ts.map
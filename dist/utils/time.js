"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERIOD_MS = void 0;
exports.bucketStart = bucketStart;
exports.inPast = inPast;
exports.clampTimeToPeriodStart = clampTimeToPeriodStart;
exports.PERIOD_MS = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
};
function bucketStart(period, now = Date.now()) {
    const w = exports.PERIOD_MS[period];
    return Math.floor(now / w) * w;
}
function inPast(ms) {
    return Date.now() - ms;
}
function clampTimeToPeriodStart(period, ts) {
    const start = bucketStart(period, ts);
    return start;
}
//# sourceMappingURL=time.js.map
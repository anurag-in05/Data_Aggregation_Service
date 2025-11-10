"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffToken = diffToken;
const DEFAULTS = {
    epsilonPricePct: 0.001,
    epsilonAbs: 1e-9,
};
function diffToken(prev, next, opts = {}) {
    if (!prev) {
        return {
            token_address: next.token_address,
            ts: Date.now(),
            changes: {},
        };
    }
    const prevObj = prev;
    const merged = { ...DEFAULTS, ...opts };
    const epsilonAbs = merged.epsilonAbs;
    const epsilonPct = merged.epsilonPricePct;
    const changes = {};
    function setIfChanged(key, cmp = (a, b) => a !== b) {
        const oldVal = prevObj[key];
        const newVal = next[key];
        if (cmp(oldVal, newVal)) {
            changes[key] = { old: oldVal, new: newVal };
        }
    }
    const numChanged = (oldVal, newVal) => {
        const a = typeof oldVal === 'number' ? oldVal : undefined;
        const b = typeof newVal === 'number' ? newVal : undefined;
        if (a === undefined && b === undefined)
            return false;
        if (a === undefined || b === undefined)
            return true;
        if (!Number.isFinite(a) || !Number.isFinite(b))
            return true;
        const abs = Math.abs(a - b);
        if (abs <= epsilonAbs)
            return false;
        const base = Math.max(Math.abs(a), epsilonAbs);
        const pct = abs / base;
        return pct > epsilonPct;
    };
    const numericKeys = [
        'price_sol',
        'market_cap_sol',
        'volume_sol',
        'liquidity_sol',
        'transaction_count',
        'price_1h_change',
        'price_24h_change',
        'price_7d_change',
    ];
    for (const k of numericKeys)
        setIfChanged(k, numChanged);
    const strKeys = ['token_name', 'token_ticker', 'protocol'];
    for (const k of strKeys)
        setIfChanged(k);
    if (Object.keys(changes).length === 0)
        return null;
    return { token_address: next.token_address, ts: Date.now(), changes };
}
//# sourceMappingURL=changes.js.map
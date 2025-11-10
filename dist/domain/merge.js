"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeTokens = mergeTokens;
const PRICE_CONFIDENCE = ["jupiter", "dexscreener", "geckoterminal"];
function choosePrice(candidates) {
    const withPrice = candidates.filter((c) => typeof c.fields.price_sol === "number");
    if (withPrice.length === 0)
        return undefined;
    withPrice.sort((a, b) => b.fetched_at - a.fetched_at);
    const freshest = withPrice[0];
    if (!freshest)
        return undefined;
    const NEAR_MS = 10000;
    const near = withPrice.filter((c) => Math.abs(c.fetched_at - freshest.fetched_at) <= NEAR_MS);
    if (near.length <= 1)
        return freshest.fields.price_sol;
    for (const src of PRICE_CONFIDENCE) {
        const hit = near.find((n) => n.source === src);
        if (hit)
            return hit.fields.price_sol;
    }
    return freshest.fields.price_sol;
}
function pickMaxNumber(sources, field) {
    let max;
    for (const s of sources) {
        const v = s.fields[field];
        if (typeof v === "number" && Number.isFinite(v)) {
            if (max === undefined || v > max)
                max = v;
        }
    }
    return max;
}
function pickFirstDefined(sources, field) {
    for (const s of sources) {
        const v = s.fields[field];
        if (v !== undefined)
            return v;
    }
    return undefined;
}
function mergeTokens(batches) {
    const flat = [].concat(...batches);
    const byAddr = new Map();
    for (const s of flat) {
        if (!s.token_address)
            continue;
        const arr = byAddr.get(s.token_address) ?? [];
        arr.push(s);
        byAddr.set(s.token_address, arr);
    }
    const unified = [];
    for (const [addr, group] of byAddr.entries()) {
        if (group.length === 0)
            continue;
        group.sort((a, b) => b.fetched_at - a.fetched_at);
        const token_name = pickFirstDefined(group, "token_name") ?? "";
        const token_ticker = pickFirstDefined(group, "token_ticker") ?? "";
        const price_sol = choosePrice(group) ?? 0;
        const market_cap_sol = pickFirstDefined(group, "market_cap_sol");
        const volume_sol = pickMaxNumber(group, "volume_sol");
        const liquidity_sol = pickMaxNumber(group, "liquidity_sol");
        const transaction_count = pickMaxNumber(group, "transaction_count");
        const protocol = pickFirstDefined(group.filter((g) => g.source !== "jupiter"), "protocol") ?? pickFirstDefined(group, "protocol");
        const merged = {
            token_address: addr,
            token_name,
            token_ticker,
            price_sol,
            market_cap_sol,
            volume_sol,
            liquidity_sol,
            transaction_count,
            price_1h_change: pickFirstDefined(group, "price_1h_change"),
            price_24h_change: pickFirstDefined(group, "price_24h_change"),
            price_7d_change: pickFirstDefined(group, "price_7d_change"),
            protocol,
            last_updated: Math.max(...group.map((g) => g.fetched_at)),
            sources: Array.from(new Set(group.map((g) => g.source))),
        };
        if (!merged.token_name)
            merged.token_name =
                merged.token_ticker || `${addr.slice(0, 4)}...${addr.slice(-4)}`;
        if (!merged.token_ticker)
            merged.token_ticker =
                merged.token_name?.slice(0, 8).toUpperCase() || "TKN";
        if (merged.price_sol < 0 || !Number.isFinite(merged.price_sol))
            merged.price_sol = 0;
        unified.push(merged);
    }
    unified.sort((a, b) => b.last_updated - a.last_updated);
    return unified;
}
//# sourceMappingURL=merge.js.map
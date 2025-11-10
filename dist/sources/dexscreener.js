"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDexScreener = fetchDexScreener;
const http_1 = require("../libs/http");
const API = "https://api.dexscreener.com/latest/dex/tokens";
async function fetchDexScreener(query = "solana") {
    const url = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`;
    const res = await (0, http_1.safeRequest)("dexscreener", async () => await http_1.http.get(url));
    if (!res)
        return [];
    const data = res.data?.pairs ?? [];
    const now = Date.now();
    return data.map((t) => ({
        source: "dexscreener",
        token_address: t.baseToken?.address ?? "",
        fetched_at: now,
        fields: {
            token_name: t.baseToken?.name,
            token_ticker: t.baseToken?.symbol,
            price_sol: parseFloat(t.priceNative ?? "0"),
            market_cap_sol: t.marketCap,
            volume_sol: t.volume?.h24 ?? t.volume?.h1,
            liquidity_sol: t.liquidity?.base ?? t.liquidity?.quote,
            transaction_count: (t.txns?.h24?.buys ?? 0) + (t.txns?.h24?.sells ?? 0),
            protocol: t.dexId,
            price_1h_change: t.priceChange?.h1,
            price_24h_change: t.priceChange?.h24,
            price_7d_change: undefined,
        },
        raw: t,
    }));
}
//# sourceMappingURL=dexscreener.js.map
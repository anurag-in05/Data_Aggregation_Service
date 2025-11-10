"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGeckoTerminal = fetchGeckoTerminal;
const http_1 = require("../libs/http");
const API = "https://api.geckoterminal.com/api/v2/networks/solana/trending_pools";
async function fetchGeckoTerminal() {
    const res = await (0, http_1.safeRequest)("geckoterminal", async () => http_1.http.get(API, { params: { page: 1 } }));
    if (!res)
        return [];
    const tokens = res.data?.data ?? [];
    const now = Date.now();
    return tokens.map((t) => ({
        source: "geckoterminal",
        token_address: t?.attributes?.address ?? "",
        fetched_at: now,
        fields: {
            token_name: t?.attributes?.name ?? "Unknown",
            token_ticker: t?.attributes?.symbol ?? "",
            price_sol: parseFloat(t?.attributes?.price_native ?? "0"),
            volume_sol: parseFloat(t?.attributes?.volume_usd?.h24 ?? "0"),
            market_cap_sol: parseFloat(t?.attributes?.market_cap_usd ?? "0"),
            liquidity_sol: parseFloat(t?.attributes?.liquidity_usd ?? "0"),
            transaction_count: parseInt(t?.attributes?.transactions?.h24 ?? "0"),
            protocol: "gecko",
            price_24h_change: parseFloat(t?.attributes?.price_change_percentage?.h24 ?? "0"),
        },
        raw: t,
    }));
}
//# sourceMappingURL=geckoterminal.js.map
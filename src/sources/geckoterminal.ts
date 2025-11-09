import { http, safeRequest } from "../libs/http";
import { SourceToken } from "../domain/types";

const API = "https://api.geckoterminal.com/api/v2/networks/solana/trending_pools";

export async function fetchGeckoTerminal(): Promise<SourceToken[]> {
  const res = await safeRequest("geckoterminal", async () =>
    http.get(API, { params: { page: 1 } })
  );

  if (!res) return []; // circuit open or request failed

  const tokens = res.data?.data ?? [];
  const now = Date.now();

  return tokens.map((t: any) => ({
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

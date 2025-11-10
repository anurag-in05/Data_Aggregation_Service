import { fetchDexScreener } from "../sources/dexscreener";
import { fetchGeckoTerminal } from "../sources/geckoterminal";
import { upsertAndDiff } from "../cache/repo";
import { Server } from "socket.io";
import { incrementCycle } from "../routes/metrics";

export async function startFetchAndCacheJob(io: Server) {
  console.log("🚀 Starting fetch-and-cache job (30 s interval)");

  const runJob = async () => {
    try {
      console.log("⏱️ Fetching tokens…");

      const useMock = process.env.MOCK_MODE === "true";
      let dexTokens: any[] = [];
      let geckoTokens: any[] = [];

      if (useMock) {
        console.log("🧪 MOCK_MODE active — using dummy tokens");
        dexTokens = [
          { token_address: "SOL", name: "Solana", price_usd: 150 },
          { token_address: "BONK", name: "Bonk", price_usd: 0.00001 },
        ];
        geckoTokens = [];
      } else {
        [dexTokens, geckoTokens] = await Promise.all([
          fetchDexScreener(),
          fetchGeckoTerminal(),
        ]);
      }

      const merged: Record<string, any> = {};
      for (const t of [...dexTokens, ...geckoTokens]) {
        merged[t.token_address] = merged[t.token_address]
          ? { ...merged[t.token_address], ...t }
          : t;
      }

      const tokens = Object.values(merged);
      console.log(`✅ ${tokens.length} tokens aggregated`);

      const deltas = await Promise.all(tokens.map((t) => upsertAndDiff(t)));
      const changed = deltas.filter(Boolean);

      if (changed.length > 0) {
        io.emit("tokens:update", changed);
        console.log(`📡 Broadcast ${changed.length} updated tokens`);
      } else {
        console.log("🟢 No significant changes this cycle");
      }

      incrementCycle();
    } catch (err) {
      console.error("❌ Fetch job failed:", err);
    }
  };

  await runJob();
  setInterval(runJob, 30_000);
}

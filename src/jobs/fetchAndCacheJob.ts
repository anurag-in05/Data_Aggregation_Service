// src/jobs/fetchAndCacheJob.ts
import { fetchDexScreener } from "../sources/dexscreener";
import { fetchGeckoTerminal } from "../sources/geckoterminal";
import { upsertAndDiff } from "../cache/repo";
import { Server } from "socket.io";
import { incrementCycle } from "../routes/metrics";

/**
 * 🔁 Fetch + Cache Job
 *  - Runs every 30 s
 *  - Fetches from DexScreener & GeckoTerminal
 *  - Deduplicates & merges
 *  - Upserts to Redis and broadcasts updates
 */
export async function startFetchAndCacheJob(io: Server) {
  console.log("🚀 Starting fetch-and-cache job (30 s interval)");

  const runJob = async () => {
    try {
      console.log("⏱️ Fetching tokens…");

      // 1️⃣ Fetch from external APIs in parallel
      const [dexTokens, geckoTokens] = await Promise.all([
        fetchDexScreener(),
        fetchGeckoTerminal(),
      ]);

      // 2️⃣ Merge & deduplicate tokens by address
      const merged: Record<string, any> = {};
      for (const t of [...dexTokens, ...geckoTokens]) {
        if (!t.token_address) continue;
        merged[t.token_address] = merged[t.token_address]
          ? { ...merged[t.token_address], ...t }
          : t;
      }

      const tokens = Object.values(merged);
      console.log(`✅ ${tokens.length} tokens aggregated`);

      // 3️⃣ Upsert into Redis & get diffs
      const deltas = await Promise.all(tokens.map((t) => upsertAndDiff(t)));
      const changed = deltas.filter(Boolean);

      // 4️⃣ Broadcast changes over WebSocket
      if (changed.length > 0) {
        io.emit("tokens:update", changed);
        console.log(`📡 Broadcast ${changed.length} updated tokens`);
      } else {
        console.log("🟢 No significant changes this cycle");
      }

      // 5️⃣ Increment cycle counter for metrics
      incrementCycle();
    } catch (err: any) {
      console.error("❌ Fetch job failed:", err?.message || err);
    }
  };

  // Run once immediately
  await runJob();

  // Repeat every 30 seconds
  setInterval(runJob, 30_000);
}

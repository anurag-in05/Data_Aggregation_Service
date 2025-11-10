"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFetchAndCacheJob = startFetchAndCacheJob;
const dexscreener_1 = require("../sources/dexscreener");
const geckoterminal_1 = require("../sources/geckoterminal");
const repo_1 = require("../cache/repo");
const metrics_1 = require("../routes/metrics");
async function startFetchAndCacheJob(io) {
    console.log("🚀 Starting fetch-and-cache job (30 s interval)");
    const runJob = async () => {
        try {
            console.log("⏱️ Fetching tokens…");
            const useMock = process.env.MOCK_MODE === "true";
            let dexTokens = [];
            let geckoTokens = [];
            if (useMock) {
                console.log("🧪 MOCK_MODE active — using dummy tokens");
                dexTokens = [
                    { token_address: "SOL", name: "Solana", price_usd: 150 },
                    { token_address: "BONK", name: "Bonk", price_usd: 0.00001 },
                ];
                geckoTokens = [];
            }
            else {
                [dexTokens, geckoTokens] = await Promise.all([
                    (0, dexscreener_1.fetchDexScreener)(),
                    (0, geckoterminal_1.fetchGeckoTerminal)(),
                ]);
            }
            const merged = {};
            for (const t of [...dexTokens, ...geckoTokens]) {
                merged[t.token_address] = merged[t.token_address]
                    ? { ...merged[t.token_address], ...t }
                    : t;
            }
            const tokens = Object.values(merged);
            console.log(`✅ ${tokens.length} tokens aggregated`);
            const deltas = await Promise.all(tokens.map((t) => (0, repo_1.upsertAndDiff)(t)));
            const changed = deltas.filter(Boolean);
            if (changed.length > 0) {
                io.emit("tokens:update", changed);
                console.log(`📡 Broadcast ${changed.length} updated tokens`);
            }
            else {
                console.log("🟢 No significant changes this cycle");
            }
            (0, metrics_1.incrementCycle)();
        }
        catch (err) {
            console.error("❌ Fetch job failed:", err);
        }
    };
    await runJob();
    setInterval(runJob, 30000);
}
//# sourceMappingURL=fetchAndCacheJob.js.map
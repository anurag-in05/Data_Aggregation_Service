import { fetchDexScreener } from "./sources/dexscreener";
import { fetchGeckoTerminal } from "./sources/geckoterminal";

(async () => {
  const [dex, gecko] = await Promise.all([
    fetchDexScreener("solana"),
    fetchGeckoTerminal(),
  ]);

  console.log("DexScreener:", dex.slice(0, 2));
  console.log("GeckoTerminal:", gecko.slice(0, 2));
})();

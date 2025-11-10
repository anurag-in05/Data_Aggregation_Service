"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dexscreener_1 = require("./sources/dexscreener");
const geckoterminal_1 = require("./sources/geckoterminal");
(async () => {
    const [dex, gecko] = await Promise.all([
        (0, dexscreener_1.fetchDexScreener)("solana"),
        (0, geckoterminal_1.fetchGeckoTerminal)(),
    ]);
    console.log("DexScreener:", dex.slice(0, 2));
    console.log("GeckoTerminal:", gecko.slice(0, 2));
})();
//# sourceMappingURL=test.js.map
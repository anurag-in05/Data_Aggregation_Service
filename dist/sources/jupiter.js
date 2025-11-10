"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJupiterPrices = fetchJupiterPrices;
const http_1 = require("../libs/http");
async function fetchJupiterPrices(tokenIds) {
    if (tokenIds.length === 0)
        return [];
    const url = `https://price.jup.ag/v4/price?ids=${tokenIds.join(",")}`;
    const res = await (0, http_1.safeRequest)("jupiter", async () => http_1.http.get(url));
    if (!res)
        return [];
    const data = res.data?.data ?? {};
    const now = Date.now();
    return Object.entries(data).map(([address, obj]) => ({
        source: "jupiter",
        token_address: address,
        fetched_at: now,
        fields: {
            price_sol: obj.price,
        },
        raw: obj,
    }));
}
//# sourceMappingURL=jupiter.js.map
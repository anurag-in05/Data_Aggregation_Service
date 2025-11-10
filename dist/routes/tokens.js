"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRoutes = tokenRoutes;
const repo_1 = require("../cache/repo");
async function tokenRoutes(fastify) {
    fastify.get("/tokens", async (req, reply) => {
        const { metric = "price", period = "24h", cursor = "0", limit = "20" } = req.query;
        const { data, next_cursor, ttl } = await (0, repo_1.listTokens)(period, metric, parseInt(cursor), parseInt(limit));
        return { ok: true, ttl, next_cursor, count: data.length, data };
    });
}
//# sourceMappingURL=tokens.js.map
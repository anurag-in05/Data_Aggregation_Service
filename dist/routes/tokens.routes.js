"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRoutes = tokenRoutes;
const repo_1 = require("../cache/repo");
async function tokenRoutes(fastify) {
    fastify.get("/tokens", async (req, reply) => {
        try {
            const query = req.query;
            const period = query.period || "24h";
            const metric = query.metric || "volume";
            const cursor = parseInt(query.cursor || "0", 10);
            const limit = parseInt(query.limit || "10", 10);
            const result = await (0, repo_1.listTokens)(period, metric, cursor, limit);
            return reply.status(200).send(result);
        }
        catch (err) {
            fastify.log.error({ err }, "❌ Failed to fetch tokens");
            return reply.status(500).send({ error: "Internal Server Error" });
        }
    });
}
//# sourceMappingURL=tokens.routes.js.map
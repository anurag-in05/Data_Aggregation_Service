// src/routes/tokens.route.ts
import { FastifyInstance } from "fastify";
import { listTokens } from "../cache/repo";

/**
 * 🧩 /tokens route
 * Example: /tokens?metric=volume&period=24h&cursor=0&limit=10
 */
export async function tokenRoutes(fastify: FastifyInstance) {
  fastify.get("/tokens", async (req, reply) => {
    try {
      const query = req.query as {
        metric?: string;
        period?: string;
        cursor?: string;
        limit?: string;
      };

      const period = query.period || "24h";
      const metric = query.metric || "volume";
      const cursor = parseInt(query.cursor || "0", 10);
      const limit = parseInt(query.limit || "10", 10);

      const result = await listTokens(period, metric, cursor, limit);
      return reply.status(200).send(result);
    } catch (err) {
      fastify.log.error({ err }, "❌ Failed to fetch tokens");
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });
}

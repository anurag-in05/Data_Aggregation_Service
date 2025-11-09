// src/routes/tokens.ts
import { FastifyInstance } from "fastify";
import { listTokens } from "../cache/repo";

export async function tokenRoutes(fastify: FastifyInstance) {
  fastify.get("/tokens", async (req, reply) => {
    const { metric = "price", period = "24h", cursor = "0", limit = "20" } =
      req.query as Record<string, string>;
    const { data, next_cursor, ttl } = await listTokens(
      period,
      metric,
      parseInt(cursor),
      parseInt(limit)
    );

    return { ok: true, ttl, next_cursor, count: data.length, data };
  });
}

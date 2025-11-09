import { FastifyInstance } from "fastify";

let cycleCount = 0;
let lastCycleAt = 0;

export function incrementCycle() {
  cycleCount++;
  lastCycleAt = Date.now();
}

export async function metricsRoutes(fastify: FastifyInstance) {
  fastify.get("/metrics", async () => ({
    uptime_seconds: process.uptime(),
    cycles_completed: cycleCount,
    last_cycle_at: lastCycleAt ? new Date(lastCycleAt).toISOString() : null,
    memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    redis_status: "ok", 
  }));
}

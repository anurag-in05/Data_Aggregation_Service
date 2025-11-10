"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementCycle = incrementCycle;
exports.metricsRoutes = metricsRoutes;
let cycleCount = 0;
let lastCycleAt = 0;
function incrementCycle() {
    cycleCount++;
    lastCycleAt = Date.now();
}
async function metricsRoutes(fastify) {
    fastify.get("/metrics", async () => ({
        uptime_seconds: process.uptime(),
        cycles_completed: cycleCount,
        last_cycle_at: lastCycleAt ? new Date(lastCycleAt).toISOString() : null,
        memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        redis_status: "ok",
    }));
}
//# sourceMappingURL=metrics.js.map
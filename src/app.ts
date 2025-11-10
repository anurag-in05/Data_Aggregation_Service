import Fastify from "fastify";
import { Server as SocketIOServer } from "socket.io";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { startFetchAndCacheJob } from "./jobs/fetchAndCacheJob";
import { tokenRoutes } from "./routes/tokens";
import { metricsRoutes } from "./routes/metrics";
import { listTokens } from "./cache/repo";
import { fastifyLogger } from "./libs/logger";

export async function buildApp() {
  // Use the centralized Fastify logger configuration. In dev this uses pino-pretty;
  // in production it falls back to a simple info-level logger that doesn't require pino-pretty.
  const fastify = Fastify({ logger: fastifyLogger });

  // ✅ Root welcome route (fix for 404 at /)
  fastify.get("/", async () => ({
    message: "Welcome to Meme Token Aggregation Service 🚀",
    routes: ["/health", "/tokens", "/metrics"],
  }));

  // ✅ Health check
  fastify.get("/health", async () => ({ status: "ok" }));

  // ✅ Register routes
  fastify.register(tokenRoutes);
  fastify.register(metricsRoutes);

  // ✅ Attach HTTP + WebSocket server
  const httpServer = createServer(
    (req: IncomingMessage, res: ServerResponse) => {
      fastify.server.emit("request", req, res);
    }
  );

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    fastify.log.info(`📡 socket connected: ${socket.id}`);
    socket.emit("welcome", { msg: "connected to real-time-agg-service" });
  });

  // ✅ Periodic broadcast
  setInterval(async () => {
    try {
      const { data } = await listTokens("24h", "volume", 0, 10);
      io.emit("tokens:update", data);
    } catch (err) {
      fastify.log.error({ err }, "Socket broadcast failed");
    }
  }, 15000);

  await fastify.ready();

  // ✅ Start fetch job (mock-safe)
  startFetchAndCacheJob(io);

  return { fastify, httpServer, io };
}

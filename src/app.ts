import Fastify from "fastify";
import { Server as SocketIOServer } from "socket.io";
import { startFetchAndCacheJob } from "./jobs/fetchAndCacheJob";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { ENV } from "./config/env";
import { tokenRoutes } from "./routes/tokens";
import { listTokens } from "./cache/repo";
import { metricsRoutes } from "./routes/metrics";


export async function buildApp() {
  const fastify = Fastify({
    logger:
      process.env.NODE_ENV === "development"
        ? {
            transport: {
              target: "pino-pretty",
              options: { colorize: true },
            },
          }
        : true,
  });

  fastify.get("/health", async (_, reply) => {
    reply.code(200).send({ status: "ok" });
  });

  fastify.register(tokenRoutes);
  fastify.register(metricsRoutes);


  const httpServer = createServer(
    (req: IncomingMessage, res: ServerResponse) => {
      fastify.server.emit("request", req, res);
    }
  );

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    fastify.log.info(` socket connected: ${socket.id}`);
    socket.emit("welcome", { msg: "connected to real-time-agg-service" });
  });

  setInterval(async () => {
    try {
      const { data } = await listTokens("24h", "volume", 0, 10);
      io.emit("tokens:update", data);
    } catch (err) {
      fastify.log.error({ err }, "Socket broadcast failed");
    }
  }, 15000);

  await fastify.ready();
  startFetchAndCacheJob(io);
  return { fastify, httpServer, io };
}

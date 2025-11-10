import { buildApp } from "./app";
import { logger } from "./libs/logger";

async function start() {
  const port = Number(process.env.PORT) || 8080;
  const { fastify, httpServer } = await buildApp();

  try {
    httpServer.listen(port, "0.0.0.0", () => {
      logger.info(`🚀 Server running on http://0.0.0.0:${port}`);
    });
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  // 🧹 Graceful shutdown
  process.on("SIGINT", async () => {
    logger.info("🛑 Shutting down gracefully...");
    await fastify.close();
    httpServer.close();
    process.exit(0);
  });
}

start();

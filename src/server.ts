import { buildApp } from "./app";
import { ENV } from "./config/env";
import { logger } from "./libs/logger";

async function start() {
  const { fastify, httpServer } = await buildApp();

  try {
    httpServer.listen(ENV.PORT, "0.0.0.0", () => {
      logger.info(`Server running on http://localhost:${ENV.PORT}`);
    });
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  // graceful shutdown
  process.on("SIGINT", async () => {
    logger.info("Shutting down...");
    await fastify.close();
    httpServer.close();
    process.exit(0);
  });
}

start();

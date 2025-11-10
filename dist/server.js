"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const logger_1 = require("./libs/logger");
async function start() {
    const port = Number(process.env.PORT) || 8080;
    const { fastify, httpServer } = await (0, app_1.buildApp)();
    try {
        httpServer.listen(port, "0.0.0.0", () => {
            logger_1.logger.info(`🚀 Server running on http://0.0.0.0:${port}`);
        });
    }
    catch (err) {
        logger_1.logger.error(err);
        process.exit(1);
    }
    process.on("SIGINT", async () => {
        logger_1.logger.info("🛑 Shutting down gracefully...");
        await fastify.close();
        httpServer.close();
        process.exit(0);
    });
}
start();
//# sourceMappingURL=server.js.map
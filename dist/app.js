"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const fetchAndCacheJob_1 = require("./jobs/fetchAndCacheJob");
const tokens_1 = require("./routes/tokens");
const metrics_1 = require("./routes/metrics");
const repo_1 = require("./cache/repo");
async function buildApp() {
    const fastify = (0, fastify_1.default)({
        logger: process.env.NODE_ENV === "development"
            ? {
                transport: {
                    target: "pino-pretty",
                    options: { colorize: true },
                },
            }
            : true,
    });
    fastify.get("/", async () => ({
        message: "Welcome to Meme Token Aggregation Service 🚀",
        routes: ["/health", "/tokens", "/metrics"],
    }));
    fastify.get("/health", async () => ({ status: "ok" }));
    fastify.register(tokens_1.tokenRoutes);
    fastify.register(metrics_1.metricsRoutes);
    const httpServer = (0, http_1.createServer)((req, res) => {
        fastify.server.emit("request", req, res);
    });
    const io = new socket_io_1.Server(httpServer, {
        cors: { origin: "*", methods: ["GET", "POST"] },
    });
    io.on("connection", (socket) => {
        fastify.log.info(`📡 socket connected: ${socket.id}`);
        socket.emit("welcome", { msg: "connected to real-time-agg-service" });
    });
    setInterval(async () => {
        try {
            const { data } = await (0, repo_1.listTokens)("24h", "volume", 0, 10);
            io.emit("tokens:update", data);
        }
        catch (err) {
            fastify.log.error({ err }, "Socket broadcast failed");
        }
    }, 15000);
    await fastify.ready();
    (0, fetchAndCacheJob_1.startFetchAndCacheJob)(io);
    return { fastify, httpServer, io };
}
//# sourceMappingURL=app.js.map
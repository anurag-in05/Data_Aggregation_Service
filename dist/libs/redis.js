"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = require("ioredis");
const env_1 = require("../config/env");
const logger_1 = require("./logger");
exports.redis = new ioredis_1.Redis(env_1.ENV.REDIS_URL);
exports.redis.on("connect", () => logger_1.logger.info("Redis connected"));
exports.redis.on("error", (err) => logger_1.logger.error({ err }, "Redis error"));
//# sourceMappingURL=redis.js.map
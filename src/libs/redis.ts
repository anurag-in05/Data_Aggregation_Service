// src/libs/redis.ts
import { Redis } from "ioredis";
import { ENV } from "../config/env";
import { logger } from "./logger";

export const redis = new Redis(ENV.REDIS_URL);

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error({ err }, "Redis error"));

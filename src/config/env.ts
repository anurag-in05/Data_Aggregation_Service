// src/config/env.ts
import dotenv from "dotenv";
dotenv.config();
export const ENV = {
  PORT: Number(process.env.PORT || 8080),
  REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  NODE_ENV: process.env.NODE_ENV || "development",
};

import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

// Minimal, production-friendly pino setup:
// - In development: use pino-pretty for readable logs
// - In production: emit JSON logs at info level (no pino-pretty required)
export const logger = pino(
  isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : { level: "info" }
);

// Fastify accepts a logger config object; expose the same shape here.
export const fastifyLogger = isDev
  ? {
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    }
  : { level: "info" };

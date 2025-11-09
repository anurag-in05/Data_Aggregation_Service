import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

const options: pino.LoggerOptions = isDev
  ? {
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    }
  : {};

export const logger = pino(options);

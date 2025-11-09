// src/libs/queue.ts
import { Queue, Worker } from "bullmq";
import { redis } from "./redis";
import { logger } from "./logger";
import { CONSTANTS } from "../config/constants";

// Reuse your existing ioredis connection
const connection = redis.duplicate();

// define queues
export const aggregatorQueue = new Queue("aggregatorQueue", { connection });
export const spikeQueue = new Queue("spikeQueue", { connection });

// helper to create a worker
export function createWorker(
  name: string,
  processor: (job: any) => Promise<void>
) {
  const worker = new Worker(name, processor, { connection });
  worker.on("completed", (job) =>
    logger.info(`${name} completed job ${job.id}`)
  );
  worker.on("failed", (job, err) =>
    logger.error({ err }, `${name} failed job ${job?.id}`)
  );
  return worker;
}

logger.info(
  `📦 BullMQ queues ready (agg interval ${CONSTANTS.AGG_INTERVAL_MS} ms)`
);

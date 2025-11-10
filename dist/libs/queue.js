"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spikeQueue = exports.aggregatorQueue = void 0;
exports.createWorker = createWorker;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
const logger_1 = require("./logger");
const constants_1 = require("../config/constants");
const connection = redis_1.redis.duplicate();
exports.aggregatorQueue = new bullmq_1.Queue("aggregatorQueue", { connection });
exports.spikeQueue = new bullmq_1.Queue("spikeQueue", { connection });
function createWorker(name, processor) {
    const worker = new bullmq_1.Worker(name, processor, { connection });
    worker.on("completed", (job) => logger_1.logger.info(`${name} completed job ${job.id}`));
    worker.on("failed", (job, err) => logger_1.logger.error({ err }, `${name} failed job ${job?.id}`));
    return worker;
}
logger_1.logger.info(`📦 BullMQ queues ready (agg interval ${constants_1.CONSTANTS.AGG_INTERVAL_MS} ms)`);
//# sourceMappingURL=queue.js.map
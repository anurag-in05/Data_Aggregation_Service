import { Queue, Worker } from "bullmq";
export declare const aggregatorQueue: Queue<any, any, string, any, any, string>;
export declare const spikeQueue: Queue<any, any, string, any, any, string>;
export declare function createWorker(name: string, processor: (job: any) => Promise<void>): Worker<any, void, string>;
//# sourceMappingURL=queue.d.ts.map
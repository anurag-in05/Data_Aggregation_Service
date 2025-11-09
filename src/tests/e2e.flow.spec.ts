import { describe, it, expect } from "vitest";
import { startFetchAndCacheJob } from "../jobs/fetchAndCacheJob";
import { Server } from "socket.io";
import { createServer } from "http";

describe("E2E Aggregation Flow", () => {
  it("runs one full fetch-and-cache cycle", async () => {
    const httpServer = createServer();
    const io = new Server(httpServer);
    await startFetchAndCacheJob(io);
    expect(true).toBe(true); // sanity check: no crash
    io.close();
  });
});

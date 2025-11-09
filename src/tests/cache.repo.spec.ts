import Redis from "ioredis-mock";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const redis = new Redis();

async function upsertToken(key: string, data: any) {
  await redis.set(key, JSON.stringify(data));
}
async function getToken(key: string) {
  const v = await redis.get(key);
  return v ? JSON.parse(v) : null;
}

describe("Cache Repository (Redis Mock)", () => {
  // 🧹 Properly typed setup & teardown
  beforeAll(async () => {
    await redis.flushall();
  });

  afterAll(async () => {
    await redis.quit();
  });

  it("stores and retrieves token", async () => {
    const token = { token_address: "SOL", fields: { price_sol: 3.14 } };
    await upsertToken("SOL", token);
    const res = await getToken("SOL");
    expect(res.fields.price_sol).toBe(3.14);
  });

  it("returns null for non-existent key", async () => {
    const res = await getToken("MISSING");
    expect(res).toBeNull();
  });
});

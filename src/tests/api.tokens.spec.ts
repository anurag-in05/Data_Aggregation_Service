import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app";

let server: any;
let fastify: any;

describe("API /tokens endpoint", () => {
  beforeAll(async () => {
    const app = await buildApp();
    fastify = app.fastify;
    server = app.httpServer;
    await new Promise(r => server.listen(8082, r));
  });

  afterAll(async () => {
    await fastify.close();
    server.close();
  });

  it("returns ok:true and valid JSON", async () => {
    const res = await request(server).get("/tokens?metric=volume&period=24h&limit=2");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("rejects invalid query params", async () => {
    const res = await request(server).get("/tokens?limit=notanumber");
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

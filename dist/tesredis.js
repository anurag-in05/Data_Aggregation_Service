"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
async function testRedis() {
    const client = (0, redis_1.createClient)({ url: "redis://localhost:6379" });
    client.on("error", (err) => console.error("Redis Client Error:", err));
    await client.connect();
    console.log("Connected to Redis");
    await client.set("ping", "pong");
    const val = await client.get("ping");
    console.log("Stored value from Redis:", val);
    await client.quit();
}
testRedis();
//# sourceMappingURL=tesredis.js.map
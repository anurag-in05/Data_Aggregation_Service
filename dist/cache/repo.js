"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertToken = upsertToken;
exports.listTokens = listTokens;
exports.upsertAndDiff = upsertAndDiff;
exports.getTTL = getTTL;
const redis_1 = require("redis");
const keys_1 = require("./keys");
const ttl_1 = require("./ttl");
let redis = null;
async function getRedis() {
    if (!redis) {
        redis = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || "redis://localhost:6379",
        });
        redis.on("error", (err) => console.error("[cache] Redis error:", err));
        await redis.connect();
        console.log("[cache] Connected to Redis");
    }
    return redis;
}
async function upsertToken(token) {
    const r = await getRedis();
    const key = (0, keys_1.tokenKey)(token.token_address);
    const json = JSON.stringify(token);
    await r.setEx(key, (0, ttl_1.ttlSeconds)(), json);
    const period = "24h";
    await Promise.all([
        r.zAdd((0, keys_1.sortedKey)(period, "volume"), [{ score: token.volume_sol ?? 0, value: key }]),
        r.zAdd((0, keys_1.sortedKey)(period, "price"), [{ score: token.price_sol ?? 0, value: key }]),
        r.zAdd((0, keys_1.sortedKey)(period, "market_cap"), [{ score: token.market_cap_sol ?? 0, value: key }]),
    ]);
}
async function listTokens(period, metric, cursor = 0, limit = 20) {
    const r = await getRedis();
    const key = (0, keys_1.sortedKey)(period, metric);
    const items = (await r.zRange(key, cursor, cursor + limit - 1)) ?? [];
    const jsons = await Promise.all(items.map((k) => r.get(k)));
    const data = jsons
        .filter(Boolean)
        .map((j) => JSON.parse(j));
    const next_cursor = data.length < limit ? null : cursor + limit;
    const ttl = await getTTL();
    return { data, next_cursor, ttl };
}
async function upsertAndDiff(token) {
    const r = await getRedis();
    const key = (0, keys_1.tokenKey)(token.token_address);
    const oldRaw = await r.get(key);
    const old = oldRaw ? JSON.parse(oldRaw) : undefined;
    await upsertToken(token);
    if (!old)
        return null;
    const changes = {};
    for (const field of Object.keys(token)) {
        const newVal = token[field];
        const oldVal = old[field];
        if (newVal !== oldVal) {
            changes[field] = { old: oldVal, new: newVal };
        }
    }
    const delta = {
        token_address: token.token_address,
        changes,
        ts: Date.now(),
    };
    await r.setEx((0, keys_1.snapKey)(token.token_address, "latest"), (0, ttl_1.ttlSeconds)(), JSON.stringify(delta));
    return delta;
}
async function getTTL() {
    const r = await getRedis();
    const ttl = await r.ttl("some_key_that_exists");
    return ttl > 0 ? ttl : (0, ttl_1.ttlSeconds)();
}
//# sourceMappingURL=repo.js.map
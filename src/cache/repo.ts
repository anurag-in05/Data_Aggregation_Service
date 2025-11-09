// src/cache/repo.ts
import { createClient, RedisClientType } from "redis";
import { tokenKey, sortedKey, snapKey } from "./keys";
import { ttlSeconds } from "./ttl";
import { TokenUnified, TokenDelta } from "../domain/types";

// 🔒 Singleton Redis connection
let redis: RedisClientType | null = null;

async function getRedis() {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    redis.on("error", (err) => console.error("[cache] Redis error:", err));
    await redis.connect();
    console.log("[cache] Connected to Redis");
  }
  return redis;
}

/**
 * 🧩 Upsert a token:
 *  - store full JSON
 *  - update sorted indexes for ranking
 */
export async function upsertToken(token: TokenUnified): Promise<void> {
  const r = await getRedis();
  const key = tokenKey(token.token_address);
  const json = JSON.stringify(token);

  await r.setEx(key, ttlSeconds(), json);

  // update sorted indexes
  const period = "24h";
  await Promise.all([
    r.zAdd(sortedKey(period, "volume"), [{ score: token.volume_sol ?? 0, value: key }]),
    r.zAdd(sortedKey(period, "price"), [{ score: token.price_sol ?? 0, value: key }]),
    r.zAdd(sortedKey(period, "market_cap"), [{ score: token.market_cap_sol ?? 0, value: key }]),
  ]);
}

/**
 * 🧭 List tokens by metric + period with cursor pagination
 */
export async function listTokens(period: string, metric: string, cursor = 0, limit = 20) {
  const r = await getRedis();
  const key = sortedKey(period, metric);

  const items = (await r.zRange(key, cursor, cursor + limit - 1)) ?? [];
  const jsons = await Promise.all(items.map((k) => r.get(k)));

  const data = jsons
    .filter(Boolean)
    .map((j) => JSON.parse(j as string) as TokenUnified);

  const next_cursor = data.length < limit ? null : cursor + limit;
  const ttl = await getTTL();

  return { data, next_cursor, ttl };
}

/**
 * 🧮 Compare new vs previous snapshot for diffing
 */
export async function upsertAndDiff(token: TokenUnified): Promise<TokenDelta | null> {
  const r = await getRedis();
  const key = tokenKey(token.token_address);
  const oldRaw = await r.get(key);
  const old = oldRaw ? (JSON.parse(oldRaw) as TokenUnified) : undefined;

  await upsertToken(token);

  if (!old) return null;

  const changes: Record<string, any> = {};
  for (const field of Object.keys(token) as (keyof TokenUnified)[]) {
    const newVal = token[field];
    const oldVal = old[field];
    if (newVal !== oldVal) {
      changes[field as string] = { old: oldVal, new: newVal };
    }
  }

  const delta: TokenDelta = {
    token_address: token.token_address,
    changes,
    ts: Date.now(),
  };

  await r.setEx(snapKey(token.token_address, "latest"), ttlSeconds(), JSON.stringify(delta));
  return delta;
}

/**
 * ⏱ Remaining freshness in seconds
 */
export async function getTTL(): Promise<number> {
  const r = await getRedis();
  const ttl = await r.ttl("some_key_that_exists");
  return ttl > 0 ? ttl : ttlSeconds();
}

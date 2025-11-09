// src/domain/merge.ts
import { SourceToken, TokenUnified } from "./types";

// Confidence priority when timestamps are close (lower index = higher trust)
const PRICE_CONFIDENCE = ["jupiter", "dexscreener", "geckoterminal"] as const;

/**
 * Pick the best price across sources.
 * Priority: newest timestamp → if timestamps close → follow confidence order.
 */
function choosePrice(candidates: SourceToken[]): number | undefined {
  const withPrice = candidates.filter(
    (c) => typeof c.fields.price_sol === "number"
  ) as Array<
    SourceToken & { fields: Required<Pick<TokenUnified, "price_sol">> }
  >;

  if (withPrice.length === 0) return undefined;

  // Sort newest first, then pick freshest
  withPrice.sort((a, b) => b.fetched_at - a.fetched_at);
  const freshest = withPrice[0];
  if (!freshest) return undefined; // satisfies TS

  // Within 10s? Prefer source with higher confidence
  const NEAR_MS = 10_000;
  const near = withPrice.filter(
    (c) => Math.abs(c.fetched_at - freshest.fetched_at) <= NEAR_MS
  );

  if (near.length <= 1) return freshest.fields.price_sol;

  for (const src of PRICE_CONFIDENCE) {
    const hit = near.find((n) => n.source === src);
    if (hit) return hit.fields.price_sol;
  }

  return freshest.fields.price_sol;
}

/** Returns the maximum numeric value for a given field across sources. */
function pickMaxNumber(
  sources: SourceToken[],
  field: keyof TokenUnified
): number | undefined {
  let max: number | undefined;
  for (const s of sources) {
    const v = s.fields[field] as unknown as number | undefined;
    if (typeof v === "number" && Number.isFinite(v)) {
      if (max === undefined || v > max) max = v;
    }
  }
  return max;
}

/** Returns the first defined value for a field across sources. */
function pickFirstDefined<T extends keyof TokenUnified>(
  sources: SourceToken[],
  field: T
): TokenUnified[T] | undefined {
  for (const s of sources) {
    const v = s.fields[field] as TokenUnified[T] | undefined;
    if (v !== undefined) return v;
  }
  return undefined;
}

/**
 * Merge multiple source token batches into unified token objects.
 */
export function mergeTokens(batches: SourceToken[][]): TokenUnified[] {
  // Flatten nested arrays
  const flat = ([] as SourceToken[]).concat(...batches);

  // Group by token_address
  const byAddr = new Map<string, SourceToken[]>();
  for (const s of flat) {
    if (!s.token_address) continue;
    const arr = byAddr.get(s.token_address) ?? [];
    arr.push(s);
    byAddr.set(s.token_address, arr);
  }

  const unified: TokenUnified[] = [];

  for (const [addr, group] of byAddr.entries()) {
    if (group.length === 0) continue; // safety

    // Prefer freshest (most recent fetched_at)
    group.sort((a, b) => b.fetched_at - a.fetched_at);

    const token_name = pickFirstDefined(group, "token_name") ?? "";
    const token_ticker = pickFirstDefined(group, "token_ticker") ?? "";
    const price_sol = choosePrice(group) ?? 0;

    const market_cap_sol = pickFirstDefined(group, "market_cap_sol");
    const volume_sol = pickMaxNumber(group, "volume_sol");
    const liquidity_sol = pickMaxNumber(group, "liquidity_sol");
    const transaction_count = pickMaxNumber(group, "transaction_count");

    // Prefer pool-aware protocol if available
    const protocol =
      pickFirstDefined(
        group.filter((g) => g.source !== "jupiter"),
        "protocol"
      ) ?? pickFirstDefined(group, "protocol");

    // Assemble unified token
    const merged: TokenUnified = {
      token_address: addr,
      token_name,
      token_ticker,
      price_sol,
      market_cap_sol,
      volume_sol,
      liquidity_sol,
      transaction_count,
      price_1h_change: pickFirstDefined(group, "price_1h_change"),
      price_24h_change: pickFirstDefined(group, "price_24h_change"),
      price_7d_change: pickFirstDefined(group, "price_7d_change"),
      protocol,
      last_updated: Math.max(...group.map((g) => g.fetched_at)),
      sources: Array.from(new Set(group.map((g) => g.source))),
    };

    // Fallbacks
    if (!merged.token_name)
      merged.token_name =
        merged.token_ticker || `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    if (!merged.token_ticker)
      merged.token_ticker =
        merged.token_name?.slice(0, 8).toUpperCase() || "TKN";

    // Guard: enforce non-negative price
    if (merged.price_sol < 0 || !Number.isFinite(merged.price_sol))
      merged.price_sol = 0;

    unified.push(merged);
  }

  // Sort deterministically (latest first)
  unified.sort((a, b) => b.last_updated - a.last_updated);
  return unified;
}

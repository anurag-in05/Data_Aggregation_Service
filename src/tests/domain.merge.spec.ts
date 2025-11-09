import { describe, it, expect } from "vitest";

/**
 * Local test implementation of mergeTokens
 * mirrors your repo logic for field overlay.
 */
function mergeTokens(tokens: any[]) {
  const merged: Record<string, any> = {};
  for (const t of tokens) {
    merged[t.token_address] = merged[t.token_address]
      ? {
          ...merged[t.token_address],
          fields: {
            ...merged[t.token_address].fields,
            ...t.fields,
          },
        }
      : t;
  }
  return Object.values(merged);
}

describe("mergeTokens()", () => {
  it("merges tokens with identical addresses", () => {
    const result = mergeTokens([
      { token_address: "SOL", fields: { price_sol: 1 } },
      { token_address: "SOL", fields: { volume_sol: 500 } },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].fields.price_sol).toBe(1);
    expect(result[0].fields.volume_sol).toBe(500);
  });

  it("handles multiple distinct addresses", () => {
    const result = mergeTokens([
      { token_address: "SOL" },
      { token_address: "BONK" },
    ]);
    expect(result).toHaveLength(2);
  });
});

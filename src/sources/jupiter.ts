import { http, safeRequest } from "../libs/http";
import { SourceToken } from "../domain/types";

export async function fetchJupiterPrices(
  tokenIds: string[]
): Promise<SourceToken[]> {
  if (tokenIds.length === 0) return [];

  const url = `https://price.jup.ag/v4/price?ids=${tokenIds.join(",")}`;
  const res = await safeRequest("jupiter", async () => http.get(url));

  if (!res) return []; // circuit open or request failed

  const data = res.data?.data ?? {};
  const now = Date.now();

  return Object.entries(data).map(([address, obj]: any) => ({
    source: "jupiter",
    token_address: address,
    fetched_at: now,
    fields: {
      price_sol: obj.price,
    },
    raw: obj,
  }));
}

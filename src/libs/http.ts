// src/libs/http.ts
import fs from "fs";
import https from "https";
import axios, { AxiosError } from "axios";
import axiosRetry from "axios-retry";

/* -------------------------------------------------------------------------- */
/* 🔒 CA BUNDLE HANDLING                                                      */
/* -------------------------------------------------------------------------- */

let httpsAgent: https.Agent;
const caPath = process.env.NODE_EXTRA_CA_CERTS;

if (caPath && fs.existsSync(caPath)) {
  httpsAgent = new https.Agent({
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  });
  console.log(`[http] Using CA bundle from ${caPath}`);
} else {
  httpsAgent = new https.Agent({ rejectUnauthorized: true });
  console.warn("[http] Using system CA store (no custom NODE_EXTRA_CA_CERTS found)");
}

/* -------------------------------------------------------------------------- */
/* ⚙️ CIRCUIT BREAKER STATE                                                  */
/* -------------------------------------------------------------------------- */

type CircuitState = {
  failures: number;
  lastFailure: number;
  openUntil: number; // epoch ms until requests are blocked
};

const circuitMap = new Map<string, CircuitState>();
const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 30_000;

/* -------------------------------------------------------------------------- */
/* 🧩 CREATE AXIOS INSTANCE                                                   */
/* -------------------------------------------------------------------------- */

export const http = axios.create({
  timeout: 10_000,
  httpsAgent,
  headers: {
    "User-Agent": "real-time-agg-service/1.0",
  },
});

/* -------------------------------------------------------------------------- */
/* 🔁 RETRY LOGIC WITH EXPONENTIAL BACKOFF                                   */
/* -------------------------------------------------------------------------- */

axiosRetry(http, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    // retry on network errors or 5xx
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           (error.response?.status ?? 0) >= 500;
  },
  onRetry: (count, error, config) => {
    console.warn(
      JSON.stringify({
        level: "warn",
        attempt: count,
        url: config.url,
        msg: "Retrying request",
      })
    );
  },
});

/* -------------------------------------------------------------------------- */
/* 🧠 CIRCUIT BREAKER WRAPPER                                                */
/* -------------------------------------------------------------------------- */

export async function safeRequest<T>(
  source: string,
  fn: () => Promise<T>
): Promise<T | null> {
  const now = Date.now();
  const state = circuitMap.get(source);

  // 🔴 if circuit is open, skip the request
  if (state && state.openUntil > now) {
    console.warn(`[http:circuit] Skipping ${source} (cooldown active)`);
    return null;
  }

  try {
    const res = await fn();

    // ✅ success → reset failures
    circuitMap.delete(source);
    return res;
  } catch (err) {
    const e = err as AxiosError;
    const code = e.response?.status ?? 0;

    // update failure state
    const failures = (state?.failures ?? 0) + 1;
    const newState: CircuitState = {
      failures,
      lastFailure: now,
      openUntil: failures >= FAILURE_THRESHOLD ? now + COOLDOWN_MS : 0,
    };
    circuitMap.set(source, newState);

    console.error(
      `[http:circuit] ${source} failed (${failures}x)${newState.openUntil ? " → circuit open" : ""}`,
      code,
      e.message
    );

    return null;
  }
}

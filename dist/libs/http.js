"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.http = void 0;
exports.safeRequest = safeRequest;
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
let httpsAgent;
const caPath = process.env.NODE_EXTRA_CA_CERTS;
if (caPath && fs_1.default.existsSync(caPath)) {
    httpsAgent = new https_1.default.Agent({
        ca: fs_1.default.readFileSync(caPath),
        rejectUnauthorized: true,
    });
    console.log(`[http] Using CA bundle from ${caPath}`);
}
else {
    httpsAgent = new https_1.default.Agent({ rejectUnauthorized: true });
    console.warn("[http] Using system CA store (no custom NODE_EXTRA_CA_CERTS found)");
}
const circuitMap = new Map();
const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 30000;
exports.http = axios_1.default.create({
    timeout: 10000,
    httpsAgent,
    headers: {
        "User-Agent": "real-time-agg-service/1.0",
    },
});
(0, axios_retry_1.default)(exports.http, {
    retries: 3,
    retryDelay: axios_retry_1.default.exponentialDelay,
    retryCondition: (error) => {
        return axios_retry_1.default.isNetworkOrIdempotentRequestError(error) ||
            (error.response?.status ?? 0) >= 500;
    },
    onRetry: (count, error, config) => {
        console.warn(JSON.stringify({
            level: "warn",
            attempt: count,
            url: config.url,
            msg: "Retrying request",
        }));
    },
});
async function safeRequest(source, fn) {
    const now = Date.now();
    const state = circuitMap.get(source);
    if (state && state.openUntil > now) {
        console.warn(`[http:circuit] Skipping ${source} (cooldown active)`);
        return null;
    }
    try {
        const res = await fn();
        circuitMap.delete(source);
        return res;
    }
    catch (err) {
        const e = err;
        const code = e.response?.status ?? 0;
        const failures = (state?.failures ?? 0) + 1;
        const newState = {
            failures,
            lastFailure: now,
            openUntil: failures >= FAILURE_THRESHOLD ? now + COOLDOWN_MS : 0,
        };
        circuitMap.set(source, newState);
        console.error(`[http:circuit] ${source} failed (${failures}x)${newState.openUntil ? " → circuit open" : ""}`, code, e.message);
        return null;
    }
}
//# sourceMappingURL=http.js.map
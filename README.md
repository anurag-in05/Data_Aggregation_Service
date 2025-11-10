# Data_Aggregation_Service

**A production-grade service for aggregating and streaming real-time token data via REST and WebSocket APIs.**

![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Fastify](https://img.shields.io/badge/Fastify-4.x-black?logo=fastify)
![Redis](https://img.shields.io/badge/Redis-6.x-red?logo=redis)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-blueviolet?logo=socketdotio)
![Vitest](https://img.shields.io/badge/Tests-Vitest-yellowgreen?logo=vitest)
![Render](https://img.shields.io/badge/Deployed%20on-Render-3D3D3D?logo=render)
![License](https://img.shields.io/badge/License-MIT-purple)

This service provides a unified, reliable, and real-time source of truth for token data. It fetches, aggregates, and caches information from multiple external sources (like DexScreener and GeckoTerminal), shielding downstream clients from rate limiting and data inconsistencies.

It's designed for applications like real-time dashboards, financial trackers, or trading bots that require fast, reliable, and streaming data updates.

---

## 🚀 Features

* **Real-time Aggregation**: Fetches and merges data from multiple token sources in the background.
* **Dual API Interface**: Provides data via a high-performance REST API (for snapshots) and a Socket.IO WebSocket API (for live streams).
* **High-Performance Caching**: Uses **Redis** to cache aggregated data, ensuring millisecond response times.
* **Intelligent Diff Tracking**: Only broadcasts data over WebSockets when a meaningful change is detected, reducing network overhead.
* **Resilient & Monitored**: Includes a `/health` check for uptime monitoring and a `/metrics` endpoint for internal statistics (memory, Redis status).
* **Production Ready**: Built with a clean, scalable architecture and comprehensively tested with unit, integration, and E2E tests using **Vitest**.
* **Developer Friendly**: Fully typed with TypeScript and includes a mock mode for easy local development.

---

## 📊 Architecture

The system is designed for high availability and low latency. A background job polls external APIs every 30 seconds. The data is processed, aggregated, and stored in Redis.

1.  **REST API** (Fastify) reads directly from the Redis cache.
2.  **WebSocket API** (Socket.IO) uses a diff-tracking mechanism to check for changes every 15 seconds and broadcasts updates to all connected clients.

```

graph TD
    subgraph External Sources
        A[DexScreener API]
        B[GeckoTerminal API]
    end

    subgraph "Data Aggregation Service (This Project)"
        C[Fetch & Cache Job <br/> (Runs every 30s)] --> D{Redis Cache <br/> (Single Source of Truth)}

        D --> E[Fastify REST API]
        D --> F[Diff Tracker <br/> (Checks every 15s)]

        E --> G[REST Clients <br/> (GET /tokens)]
        F -- "Broadcasts 'tokens:update' on change" --> H[Socket.IO Server]
        H --> I[WebSocket Clients]
    end

    External Sources --> C

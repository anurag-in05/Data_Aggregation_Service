# 🧩 Data Aggregation Service
**“Real-time token analytics, unified and streamed.”**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-Framework-black?logo=fastify)](https://fastify.dev)
[![Redis](https://img.shields.io/badge/Redis-Cache-red?logo=redis)](https://redis.io/)
[![Render](https://img.shields.io/badge/Render-Deployed-blueviolet?logo=render)](https://render.com)

---

## 🚀 Overview

**Data Aggregation Service** is a backend that aggregates, caches, and streams **live token data** from decentralized exchanges like **DexScreener** and **GeckoTerminal**.  
It exposes both **REST APIs** and **WebSocket streams** for clients to receive continuously updated token analytics in real time.

### 💡 Why it’s useful
- Combines data from multiple DeFi APIs into one unified interface.
- Broadcasts live token updates every 15 seconds.
- Caches results in Redis for performance and fault tolerance.
- Tested, modular, and production-ready — ideal for scaling analytics dashboards or bots.

---

## 🧠 Architecture

```mermaid
graph TD
    A[DexScreener API] --> D[Aggregator Worker]
    B[GeckoTerminal API] --> D
    D -->|mergeTokens()| C[Redis Cache]
    C --> E[Fastify REST API]
    C --> F[Socket.IO WebSocket Server]
    E --> G[Client Fetch /tokens]
    F --> H[Client Live Updates]

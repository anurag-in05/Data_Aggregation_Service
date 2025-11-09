import express, { Request, Response } from "express";
import { listTokens } from "../cache/repo";

export const tokensRouter = express.Router();

/**
 * GET /tokens
 * Example: /tokens?metric=volume&period=24h&cursor=0&limit=10
 */
tokensRouter.get("/", async (req: Request, res: Response) => {
  try {
    const metric = (req.query.metric as string) || "volume";
    const period = (req.query.period as string) || "24h";
    const cursor = parseInt((req.query.cursor as string) || "0");
    const limit = parseInt((req.query.limit as string) || "20");

    const result = await listTokens(period, metric, cursor, limit);
    res.json(result);
  } catch (err) {
    console.error("[api] /tokens error:", err);
    res.status(500).json({ error: "Failed to list tokens" });
  }
});

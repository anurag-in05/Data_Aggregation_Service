"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokensRouter = void 0;
const express_1 = __importDefault(require("express"));
const repo_1 = require("../cache/repo");
exports.tokensRouter = express_1.default.Router();
exports.tokensRouter.get("/", async (req, res) => {
    try {
        const metric = req.query.metric || "volume";
        const period = req.query.period || "24h";
        const cursor = parseInt(req.query.cursor || "0");
        const limit = parseInt(req.query.limit || "20");
        const result = await (0, repo_1.listTokens)(period, metric, cursor, limit);
        res.json(result);
    }
    catch (err) {
        console.error("[api] /tokens error:", err);
        res.status(500).json({ error: "Failed to list tokens" });
    }
});
//# sourceMappingURL=tokens.route.js.map
import type { RequestHandler } from "express";
import { isDbConnected } from "../config/db.js";
import { env } from "../config/env.js";

const startedAt = Date.now();

export const getHealth: RequestHandler = (_req, res) => {
  res.json({
    ok: true,
    service: "nexushub-server",
    env: env.NODE_ENV,
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    db: isDbConnected() ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
};
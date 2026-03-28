import { Router } from "express";
import os from "node:os";
import fs from "node:fs";
import { config } from "../config.js";

export const systemRouter = Router();

/**
 * GET /health
 * Public health check — no auth required.
 */
systemRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * GET /system/info
 * System information — disk space, OS, uptime.
 */
systemRouter.get("/info", (_req, res) => {
  const rootStat = fs.statfsSync(config.rootDir);

  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    uptime: os.uptime(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    disk: {
      total: rootStat.blocks * rootStat.bsize,
      free: rootStat.bfree * rootStat.bsize,
      available: rootStat.bavail * rootStat.bsize,
    },
  });
});

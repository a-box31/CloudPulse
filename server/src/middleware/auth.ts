import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

/**
 * Middleware that validates the X-Server-Key header against the configured API key.
 * All file operation routes must use this middleware.
 */
export function validateServerKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const key = req.headers["x-server-key"];

  if (!key || key !== config.apiKey) {
    res.status(401).json({ error: "Invalid or missing server key" });
    return;
  }

  next();
}

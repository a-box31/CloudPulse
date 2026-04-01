import type { Request, Response, NextFunction } from "express";
import { createHmac } from "node:crypto";
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

  if (key && key === config.apiKey) {
    next();
    return;
  }

  // Also accept a short-lived upload token for direct client uploads
  const uploadToken = req.headers["x-upload-token"] as string | undefined;
  if (uploadToken && validateUploadToken(uploadToken)) {
    next();
    return;
  }

  res.status(401).json({ error: "Invalid or missing server key" });
}

/**
 * Validate a short-lived HMAC upload token.
 * Format: upload:<serverId>:<userId>:<expires>:<signature>
 */
function validateUploadToken(token: string): boolean {
  const lastColon = token.lastIndexOf(":");
  if (lastColon === -1) return false;

  const data = token.substring(0, lastColon);
  const signature = token.substring(lastColon + 1);

  // Verify expiry
  const parts = data.split(":");
  const expires = parseInt(parts[3], 10);
  if (isNaN(expires) || Date.now() > expires) return false;

  // Verify HMAC
  const expected = createHmac("sha256", config.apiKey)
    .update(data)
    .digest("hex");

  return signature === expected;
}

import path from "node:path";
import fs from "node:fs";
import { config } from "../config.js";

/**
 * Resolves a user-provided relative path against ROOT_DIR and validates
 * it does not escape the root. Returns the absolute path if safe.
 * Throws if the path is invalid or attempts traversal.
 */
export function resolveSafePath(requestedPath: string): string {
  // Reject null bytes
  if (requestedPath.includes("\0")) {
    throw new PathSecurityError("Path contains null bytes");
  }

  // Strip leading slashes so the path is always relative to rootDir
  // e.g. "/" → ".", "/photos" → "photos"
  const sanitized = requestedPath.replace(/^\/+/, "") || ".";

  const rootDir = path.resolve(config.rootDir);
  const resolved = path.resolve(rootDir, sanitized);

  // Must be within root directory
  if (!resolved.startsWith(rootDir + path.sep) && resolved !== rootDir) {
    throw new PathSecurityError("Path traversal detected");
  }

  return resolved;
}

/**
 * Same as resolveSafePath but also verifies the path exists on disk.
 */
export function resolveSafePathExists(requestedPath: string): string {
  const resolved = resolveSafePath(requestedPath);

  if (!fs.existsSync(resolved)) {
    throw new PathSecurityError("Path not found");
  }

  // Resolve symlinks and verify the real path is still within root
  const realPath = fs.realpathSync(resolved);
  const rootDir = path.resolve(config.rootDir);

  if (!realPath.startsWith(rootDir + path.sep) && realPath !== rootDir) {
    throw new PathSecurityError("Symlink target outside root directory");
  }

  return realPath;
}

export class PathSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PathSecurityError";
  }
}

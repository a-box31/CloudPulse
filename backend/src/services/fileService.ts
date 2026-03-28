import fs from "node:fs";
import path from "node:path";
import mime from "mime-types";
import { resolveSafePath, resolveSafePathExists } from "../utils/pathSecurity.js";

export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  mimeType: string | null;
  sizeBytes: number;
  modifiedAt: string;
}

/**
 * List directory contents at the given relative path.
 */
export async function listDirectory(dirPath: string): Promise<FileInfo[]> {
  const resolved = resolveSafePathExists(dirPath);
  const stat = fs.statSync(resolved);

  if (!stat.isDirectory()) {
    throw new Error("Path is not a directory");
  }

  const entries = fs.readdirSync(resolved, { withFileTypes: true });
  const files: FileInfo[] = [];

  for (const entry of entries) {
    // Skip hidden files/dirs starting with '.'
    if (entry.name.startsWith(".")) continue;

    const entryPath = path.join(dirPath, entry.name);
    const fullPath = path.join(resolved, entry.name);

    try {
      const entryStat = fs.statSync(fullPath);
      files.push({
        name: entry.name,
        path: entryPath,
        isDirectory: entry.isDirectory(),
        mimeType: entry.isDirectory() ? null : mime.lookup(entry.name) || null,
        sizeBytes: entryStat.size,
        modifiedAt: entryStat.mtime.toISOString(),
      });
    } catch {
      // Skip entries we can't stat (permission errors, broken symlinks, etc.)
    }
  }

  // Sort: directories first, then alphabetical
  files.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return files;
}

/**
 * Get metadata for a single file.
 */
export function getFileInfo(filePath: string): FileInfo {
  const resolved = resolveSafePathExists(filePath);
  const stat = fs.statSync(resolved);
  const name = path.basename(resolved);

  return {
    name,
    path: filePath,
    isDirectory: stat.isDirectory(),
    mimeType: stat.isDirectory() ? null : mime.lookup(name) || null,
    sizeBytes: stat.size,
    modifiedAt: stat.mtime.toISOString(),
  };
}

/**
 * Create a read stream for the file, optionally with byte range.
 */
export function createFileStream(
  filePath: string,
  start?: number,
  end?: number
): { stream: fs.ReadStream; stat: fs.Stats; mimeType: string } {
  const resolved = resolveSafePathExists(filePath);
  const stat = fs.statSync(resolved);

  if (stat.isDirectory()) {
    throw new Error("Cannot stream a directory");
  }

  const mimeType =
    mime.lookup(path.basename(resolved)) || "application/octet-stream";

  const options: { start?: number; end?: number } = {};
  if (start !== undefined) options.start = start;
  if (end !== undefined) options.end = end;

  const stream = fs.createReadStream(resolved, options);
  return { stream, stat, mimeType };
}

/**
 * Create a directory at the given relative path.
 */
export function makeDirectory(dirPath: string): void {
  const resolved = resolveSafePath(dirPath);
  fs.mkdirSync(resolved, { recursive: true });
}

/**
 * Move/rename a file or directory.
 */
export function moveFile(fromPath: string, toPath: string): void {
  const resolvedFrom = resolveSafePathExists(fromPath);
  const resolvedTo = resolveSafePath(toPath);
  fs.renameSync(resolvedFrom, resolvedTo);
}

/**
 * Delete a file or directory.
 */
export function deleteFile(filePath: string): void {
  const resolved = resolveSafePathExists(filePath);
  const stat = fs.statSync(resolved);

  if (stat.isDirectory()) {
    fs.rmSync(resolved, { recursive: true });
  } else {
    fs.unlinkSync(resolved);
  }
}

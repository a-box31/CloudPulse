import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import Busboy from "busboy";
import {
  listDirectory,
  getFileInfo,
  createFileStream,
  makeDirectory,
  moveFile,
  deleteFile,
  searchFiles,
} from "../services/fileService.js";
import { resolveSafePath, PathSecurityError } from "../utils/pathSecurity.js";

export const filesRouter = Router();

/**
 * Handle path security errors consistently.
 */
function handleError(err: unknown, res: import("express").Response): void {
  if (err instanceof PathSecurityError) {
    res.status(403).json({ error: err.message });
    return;
  }
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
}

/**
 * GET /files/list?path=/
 * List directory contents.
 */
filesRouter.get("/list", async (req, res) => {
  try {
    const dirPath = (req.query.path as string) || "/";
    const files = await listDirectory(dirPath);
    res.json({ path: dirPath, files });
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * GET /files/search?q=photo&limit=50
 * Search for files and directories by name.
 */
filesRouter.get("/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query || !query.trim()) {
      res.status(400).json({ error: "q query parameter required" });
      return;
    }
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const results = await searchFiles(query.trim(), limit);
    res.json({ query, results });
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * GET /files/info?path=/photos/cat.jpg
 * Get file metadata.
 */
filesRouter.get("/info", (req, res) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) {
      res.status(400).json({ error: "path query parameter required" });
      return;
    }
    const info = getFileInfo(filePath);
    res.json(info);
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * GET /files/download?path=/photos/cat.jpg
 * Download a file (Content-Disposition: attachment).
 */
filesRouter.get("/download", (req, res) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) {
      res.status(400).json({ error: "path query parameter required" });
      return;
    }

    const { stream, stat, mimeType } = createFileStream(filePath);

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", stat.size);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filePath.split("/").pop() || "file")}"`
    );

    stream.pipe(res);
    stream.on("error", () => {
      if (!res.headersSent) {
        res.status(500).json({ error: "Error reading file" });
      }
    });
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * GET /files/stream?path=/videos/movie.mp4
 * Stream a file with Range header support for video/audio seeking.
 */
filesRouter.get("/stream", (req, res) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) {
      res.status(400).json({ error: "path query parameter required" });
      return;
    }

    const { stat, mimeType } = createFileStream(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const { stream } = createFileStream(filePath, start, end);

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": mimeType,
      });

      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": mimeType,
        "Accept-Ranges": "bytes",
      });

      const { stream } = createFileStream(filePath);
      stream.pipe(res);
    }
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * POST /files/upload?destPath=/
 * Upload a file via multipart form data.
 */
filesRouter.post("/upload", (req, res) => {
  try {
    const destPath = (req.query.destPath as string) || "/";
    const destDir = resolveSafePath(destPath);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const busboy = Busboy({ headers: req.headers });
    let fileWritePromise: Promise<{
      name: string;
      path: string;
      size: number;
    }> | null = null;

    busboy.on("file", (_fieldname, fileStream, info) => {
      const { filename } = info;
      const safeName = path.basename(filename);
      const filePath = path.join(destDir, safeName);
      const writeStream = fs.createWriteStream(filePath);
      let size = 0;

      fileStream.on("data", (chunk: Buffer) => {
        size += chunk.length;
      });

      fileStream.pipe(writeStream);

      fileWritePromise = new Promise((resolve, reject) => {
        writeStream.on("close", () => {
          const relativePath =
            destPath.replace(/\/+$/, "") + "/" + safeName;
          resolve({ name: safeName, path: relativePath, size });
        });
        writeStream.on("error", reject);
      });
    });

    busboy.on("finish", async () => {
      try {
        if (fileWritePromise) {
          const uploadedFile = await fileWritePromise;
          res.json({ success: true, file: uploadedFile });
        } else {
          res.status(400).json({ error: "No file uploaded" });
        }
      } catch (err) {
        handleError(err, res);
      }
    });

    busboy.on("error", (err: Error) => {
      handleError(err, res);
    });

    req.pipe(busboy);
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * POST /files/mkdir
 * Create a directory.
 */
filesRouter.post("/mkdir", (req, res) => {
  try {
    const { path: dirPath } = req.body;
    if (!dirPath) {
      res.status(400).json({ error: "path is required" });
      return;
    }
    makeDirectory(dirPath);
    res.json({ success: true, path: dirPath });
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * POST /files/move
 * Move/rename a file or directory.
 */
filesRouter.post("/move", (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      res.status(400).json({ error: "from and to are required" });
      return;
    }
    moveFile(from, to);
    res.json({ success: true, from, to });
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * DELETE /files/delete
 * Delete a file or directory.
 */
filesRouter.delete("/delete", (req, res) => {
  try {
    const { path: filePath } = req.body;
    if (!filePath) {
      res.status(400).json({ error: "path is required" });
      return;
    }
    deleteFile(filePath);
    res.json({ success: true, path: filePath });
  } catch (err) {
    handleError(err, res);
  }
});

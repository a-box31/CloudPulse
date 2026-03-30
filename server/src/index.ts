import express from "express";
import { config } from "./config.js";
import { corsMiddleware } from "./middleware/cors.js";
import { validateServerKey } from "./middleware/auth.js";
import { filesRouter } from "./routes/files.js";
import { systemRouter } from "./routes/system.js";
import { establishConnection, cleanup, getLanUrl } from "./services/tunnel.js";
import { startHeartbeat, stopHeartbeat } from "./services/registration.js";

const app = express();

// Global middleware
app.use(corsMiddleware);
app.use(express.json());

// Public routes (no auth)
app.use("/", systemRouter);

// Protected routes (require X-Server-Key)
app.use("/files", validateServerKey, filesRouter);

// Start server
const server = app.listen(config.port, async () => {
  console.log(`[server] cloudpulse backend running on port ${config.port}`);
  console.log(`[server] Serving files from: ${config.rootDir}`);

  // Detect LAN address
  const lanUrl = getLanUrl(config.port);
  if (lanUrl) {
    console.log(`[server] LAN URL: ${lanUrl}`);
  }

  // Establish public connection (UPnP / NAT-PMP / manual)
  const publicUrl = await establishConnection(config.port);
  console.log(`[server] Public URL: ${publicUrl}`);

  // Start heartbeat to cloud frontend
  startHeartbeat(publicUrl, lanUrl);
});

// Graceful shutdown
async function shutdown(): Promise<void> {
  console.log("\n[server] Shutting down...");
  stopHeartbeat();
  await cleanup(config.port);
  server.close(() => {
    console.log("[server] Goodbye!");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

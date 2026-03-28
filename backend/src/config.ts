import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  cloudUrl: process.env.CLOUD_URL || "",
  serverId: process.env.SERVER_ID || "",
  apiKey: process.env.API_KEY || "",
  rootDir: process.env.ROOT_DIR || "./files",
  heartbeatInterval: 60_000, // 60 seconds
  upnpLeaseTtl: 3600, // 1 hour
  upnpRenewInterval: 30 * 60_000, // 30 minutes
};

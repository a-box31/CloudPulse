import { config } from "../config.js";

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Send a heartbeat to the cloud frontend to register/update this server.
 */
export async function sendHeartbeat(
  publicUrl: string,
  lanUrl: string | null
): Promise<void> {
  if (!config.cloudUrl || !config.serverId || !config.apiKey) {
    console.log("[registration] Missing cloud config, skipping heartbeat");
    return;
  }

  try {
    const response = await fetch(
      `${config.cloudUrl}/api/servers/${config.serverId}/heartbeat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Server-Key": config.apiKey,
          "X-Server-Id": config.serverId,
        },
        body: JSON.stringify({ publicUrl, lanUrl }),
      }
    );

    if (!response.ok) {
      console.error(
        `[registration] Heartbeat failed: ${response.status} ${response.statusText}`
      );
    } else {
      console.log("[registration] Heartbeat sent successfully");
    }
  } catch (err) {
    console.error(
      `[registration] Heartbeat error: ${err instanceof Error ? err.message : err}`
    );
  }
}

/**
 * Start periodic heartbeat to the cloud frontend.
 */
export function startHeartbeat(publicUrl: string, lanUrl: string | null): void {
  // Send immediately on startup
  sendHeartbeat(publicUrl, lanUrl);

  // Then repeat on interval
  heartbeatTimer = setInterval(() => {
    sendHeartbeat(publicUrl, lanUrl);
  }, config.heartbeatInterval);
}

/**
 * Stop the heartbeat loop.
 */
export function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

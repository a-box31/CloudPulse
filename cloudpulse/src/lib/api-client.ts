import { prisma } from "./db";

/**
 * Look up a server and verify it belongs to the given user.
 * Returns the server record with apiKey and publicUrl.
 */
export async function getServerForUser(serverId: string, userId: string) {
  const server = await prisma.server.findFirst({
    where: { id: serverId, userId },
  });

  if (!server) {
    throw new Error("Server not found");
  }

  if (!server.publicUrl && !server.lanUrl) {
    throw new Error("Server has no reachable URL (is it running?)");
  }

  if (!server.isOnline) {
    throw new Error("Server is offline");
  }

  return server;
}

/**
 * Make a request to an Express backend server.
 * Tries the publicUrl first, then lanUrl (for LAN clients), then localhost
 * (for same-machine setups where hairpin NAT may not work).
 */
export async function proxyToBackend(
  server: { publicUrl: string | null; lanUrl?: string | null; apiKey: string },
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!server.publicUrl && !server.lanUrl) {
    throw new Error("Server has no reachable URL (is it running?)");
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      "X-Server-Key": server.apiKey,
    },
  };

  // Try the public URL first
  if (server.publicUrl) {
    try {
      const url = `${server.publicUrl}${path}`;
      const response = await fetch(url, fetchOptions);
      return response;
    } catch {
      console.log(`[proxy] Public URL failed: ${server.publicUrl}`);
    }
  }

  // Try the LAN URL (for clients on the same network)
  if (server.lanUrl) {
    try {
      const url = `${server.lanUrl}${path}`;
      console.log(`[proxy] Trying LAN URL: ${url}`);
      const response = await fetch(url, fetchOptions);
      return response;
    } catch {
      console.log(`[proxy] LAN URL failed: ${server.lanUrl}`);
    }
  }

  // Last resort: localhost fallback (same machine / hairpin NAT)
  const port =
    (server.publicUrl && new URL(server.publicUrl).port) ||
    (server.lanUrl && new URL(server.lanUrl).port) ||
    "4000";
  const localUrl = `http://localhost:${port}${path}`;
  console.log(`[proxy] Trying localhost fallback: ${localUrl}`);
  return fetch(localUrl, fetchOptions);
}

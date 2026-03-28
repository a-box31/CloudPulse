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

  if (!server.publicUrl) {
    throw new Error("Server has no public URL (is it running?)");
  }

  if (!server.isOnline) {
    throw new Error("Server is offline");
  }

  return server;
}

/**
 * Make a request to an Express backend server.
 * Tries the publicUrl first, falls back to localhost (for same-machine setups
 * where hairpin NAT may not work).
 */
export async function proxyToBackend(
  server: { publicUrl: string | null; apiKey: string },
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!server.publicUrl) {
    throw new Error("Server has no public URL");
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      "X-Server-Key": server.apiKey,
    },
  };

  // Try the public URL first
  try {
    const url = `${server.publicUrl}${path}`;
    const response = await fetch(url, fetchOptions);
    return response;
  } catch {
    // Public URL failed — try localhost fallback (same-machine / hairpin NAT issue)
    const port = new URL(server.publicUrl).port || "4000";
    const localUrl = `http://localhost:${port}${path}`;
    console.log(`[proxy] Public URL failed, trying localhost fallback: ${localUrl}`);
    return fetch(localUrl, fetchOptions);
  }
}

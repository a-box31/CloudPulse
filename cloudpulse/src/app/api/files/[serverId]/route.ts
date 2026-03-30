import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { getServerForUser, proxyToBackend } from "@/lib/api-client";

/**
 * GET /api/files/[serverId]?path=/&sort=name
 * Proxy directory listing from the Express backend.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const token = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    const { serverId } = await params;
    const dirPath = request.nextUrl.searchParams.get("path") || "/";

    const server = await getServerForUser(serverId, payload.sub);
    const backendPath = `/files/list?path=${encodeURIComponent(dirPath)}`;
    console.log(`[files proxy] Fetching from backend: ${server.publicUrl}${backendPath}`);

    const response = await proxyToBackend(server, backendPath);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error(`[files proxy] Error:`, message);
    const status = message.includes("not found")
      ? 404
      : message.includes("offline")
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

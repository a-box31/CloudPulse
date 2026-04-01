import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { getServerForUser } from "@/lib/api-client";

/**
 * POST /api/files/[serverId]/upload?destPath=/uploads/
 * Proxy file upload to the Express backend.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    const { serverId } = await params;
    const destPath = request.nextUrl.searchParams.get("destPath") || "/";

    const server = await getServerForUser(serverId, payload.sub);

    const backendPath = `/files/upload?destPath=${encodeURIComponent(destPath)}`;

    // Try public URL → LAN URL → localhost fallback
    const urls = [
      server.publicUrl,
      server.lanUrl,
      `http://localhost:${(server.publicUrl && new URL(server.publicUrl).port) || (server.lanUrl && new URL(server.lanUrl).port) || "4000"}`,
    ].filter(Boolean) as string[];

    // Probe each URL with a HEAD request to find a reachable backend,
    // so we can stream the body (which can only be consumed once).
    let reachableBase: string | null = null;
    for (const baseUrl of urls) {
      try {
        await fetch(`${baseUrl}/health`, {
          method: "HEAD",
          signal: AbortSignal.timeout(3000),
        });
        reachableBase = baseUrl;
        break;
      } catch {
        console.log(`[upload] Failed to reach ${baseUrl}, trying next...`);
      }
    }
    if (!reachableBase) {
      throw new Error("All backend URLs unreachable");
    }

    // Stream the body directly to the reachable backend — no buffering.
    const response = await fetch(`${reachableBase}${backendPath}`, {
      method: "POST",
      headers: {
        "X-Server-Key": server.apiKey,
        "Content-Type": request.headers.get("content-type") || "",
      },
      body: request.body,
      // @ts-expect-error -- Node fetch supports duplex streaming
      duplex: "half",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

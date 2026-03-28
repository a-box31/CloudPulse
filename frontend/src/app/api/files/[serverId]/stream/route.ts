import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { getServerForUser, proxyToBackend } from "@/lib/api-client";

/**
 * GET /api/files/[serverId]/stream?path=/videos/movie.mp4
 * Proxy file stream with Range header support for video/audio seeking.
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
    const filePath = request.nextUrl.searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "path parameter required" },
        { status: 400 }
      );
    }

    const server = await getServerForUser(serverId, payload.sub);

    // Forward Range header for seeking support
    const headers: Record<string, string> = {};
    const range = request.headers.get("range");
    if (range) {
      headers["Range"] = range;
    }

    const response = await proxyToBackend(
      server,
      `/files/stream?path=${encodeURIComponent(filePath)}`,
      { headers }
    );

    // Forward all relevant headers from the backend
    const responseHeaders: Record<string, string> = {};
    for (const key of [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
    ]) {
      const value = response.headers.get(key);
      if (value) {
        responseHeaders[key] = value;
      }
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { getServerForUser, proxyToBackend } from "@/lib/api-client";

/**
 * GET /api/files/[serverId]/download?path=/photos/cat.jpg
 * Proxy file download from the Express backend.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("accessToken")?.value ||
      request.nextUrl.searchParams.get("token");

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
    const response = await proxyToBackend(
      server,
      `/files/download?path=${encodeURIComponent(filePath)}`
    );

    // Stream the response back
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/octet-stream",
        "Content-Length": response.headers.get("Content-Length") || "",
        "Content-Disposition":
          response.headers.get("Content-Disposition") || "",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

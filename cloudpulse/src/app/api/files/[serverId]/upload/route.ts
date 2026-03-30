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
    const token = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    const { serverId } = await params;
    const destPath = request.nextUrl.searchParams.get("destPath") || "/";

    const server = await getServerForUser(serverId, payload.sub);

    const backendPath = `/files/upload?destPath=${encodeURIComponent(destPath)}`;
    const fetchOptions = {
      method: "POST",
      headers: {
        "X-Server-Key": server.apiKey,
        "Content-Type": request.headers.get("content-type") || "",
      },
      body: request.body,
      duplex: "half",
    } as RequestInit;

    // Try public URL → LAN URL → localhost fallback
    let response: Response;
    const urls = [
      server.publicUrl,
      server.lanUrl,
      `http://localhost:${(server.publicUrl && new URL(server.publicUrl).port) || (server.lanUrl && new URL(server.lanUrl).port) || "4000"}`,
    ].filter(Boolean) as string[];

    let lastError: unknown;
    for (const baseUrl of urls) {
      try {
        response = await fetch(`${baseUrl}${backendPath}`, fetchOptions);
        break;
      } catch (e) {
        lastError = e;
        console.log(`[upload] Failed to reach ${baseUrl}, trying next...`);
      }
    }
    if (!response!) {
      throw lastError || new Error("All backend URLs unreachable");
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

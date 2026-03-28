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

    // Try public URL first, fall back to localhost (hairpin NAT)
    let response: Response;
    try {
      response = await fetch(
        `${server.publicUrl}${backendPath}`,
        fetchOptions
      );
    } catch {
      const port = new URL(server.publicUrl!).port || "4000";
      response = await fetch(
        `http://localhost:${port}${backendPath}`,
        fetchOptions
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

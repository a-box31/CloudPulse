import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { getServerForUser } from "@/lib/api-client";
import { createHmac } from "node:crypto";

/**
 * POST /api/files/[serverId]/upload-token
 * Returns backend URLs and a short-lived upload token so the client
 * can upload directly to the Express backend, bypassing the Next.js proxy.
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
    const server = await getServerForUser(serverId, payload.sub);

    // Create a short-lived upload token (valid for 10 minutes)
    const expires = Date.now() + 10 * 60 * 1000;
    const data = `upload:${serverId}:${payload.sub}:${expires}`;
    const signature = createHmac("sha256", server.apiKey)
      .update(data)
      .digest("hex");
    const uploadToken = `${data}:${signature}`;

    const urls = [
      server.publicUrl,
      server.lanUrl,
    ].filter(Boolean) as string[];

    return NextResponse.json({ urls, uploadToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

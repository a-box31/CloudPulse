import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { getServerForUser, proxyToBackend } from "@/lib/api-client";

export async function GET(
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
    const query = request.nextUrl.searchParams.get("q") || "";
    const limit = request.nextUrl.searchParams.get("limit") || "50";

    if (!query.trim()) {
      return NextResponse.json({ error: "q parameter required" }, { status: 400 });
    }

    const server = await getServerForUser(serverId, payload.sub);
    const backendPath = `/files/search?q=${encodeURIComponent(query)}&limit=${encodeURIComponent(limit)}`;
    const response = await proxyToBackend(server, backendPath);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

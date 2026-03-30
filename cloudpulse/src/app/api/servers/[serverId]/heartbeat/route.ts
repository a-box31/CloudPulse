import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/servers/[serverId]/heartbeat
 * Called by the Express backend to report it's online.
 * Authenticated via X-Server-Key header (not JWT).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const apiKey = request.headers.get("x-server-key");
    const { serverId } = await params;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing X-Server-Key header" },
        { status: 401 }
      );
    }

    const server = await prisma.server.findFirst({
      where: { id: serverId, apiKey },
    });

    if (!server) {
      return NextResponse.json(
        { error: "Invalid server or API key" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { publicUrl, lanUrl } = body;

    await prisma.server.update({
      where: { id: serverId },
      data: {
        publicUrl: publicUrl || server.publicUrl,
        lanUrl: lanUrl ?? server.lanUrl,
        lastSeen: new Date(),
        isOnline: true,
      },
    });

    return NextResponse.json({ status: "registered" });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

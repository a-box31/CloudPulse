import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";

/**
 * GET /api/servers/[serverId] — Get a single server's details.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  const token = request.headers
    .get("authorization")
    ?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { serverId } = await params;

    const server = await prisma.server.findFirst({
      where: { id: serverId, userId: payload.sub },
      select: {
        id: true,
        name: true,
        publicUrl: true,
        lanUrl: true,
        lastSeen: true,
        isOnline: true,
        createdAt: true,
      },
    });

    if (!server) {
      return NextResponse.json(
        { error: "Server not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ server });
  } catch (error) {
    console.error("GET /api/servers/[serverId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/servers/[serverId] — Unregister a server.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  const token = request.headers
    .get("authorization")
    ?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { serverId } = await params;

    const server = await prisma.server.findFirst({
      where: { id: serverId, userId: payload.sub },
    });

    if (!server) {
      return NextResponse.json(
        { error: "Server not found" },
        { status: 404 }
      );
    }

    await prisma.server.delete({ where: { id: serverId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/servers/[serverId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken, generateApiKey } from "@/lib/auth";

/**
 * GET /api/servers — List all servers for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);

    const servers = await prisma.server.findMany({
      where: { userId: payload.sub },
      select: {
        id: true,
        name: true,
        publicUrl: true,
        lastSeen: true,
        isOnline: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ servers });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/**
 * POST /api/servers — Register a new server.
 * Returns the serverId and apiKey (shown once to the user).
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Server name is required" },
        { status: 400 }
      );
    }

    const apiKey = generateApiKey();

    const server = await prisma.server.create({
      data: {
        name,
        userId: payload.sub,
        apiKey,
      },
    });

    return NextResponse.json({
      server: {
        id: server.id,
        name: server.name,
        apiKey, // Only shown once at creation
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

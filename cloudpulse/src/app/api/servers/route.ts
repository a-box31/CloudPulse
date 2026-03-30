import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken, generateApiKey } from "@/lib/auth";

/**
 * GET /api/servers — List all servers for the authenticated user.
 */
export async function GET(request: NextRequest) {
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
    const servers = await prisma.server.findMany({
      where: { userId: payload.sub },
      select: {
        id: true,
        name: true,
        publicUrl: true,
        lanUrl: true,
        lastSeen: true,
        isOnline: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ servers });
  } catch (error) {
    console.error("GET /api/servers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/servers — Register a new server.
 * Returns the serverId and apiKey (shown once to the user).
 */
export async function POST(request: NextRequest) {
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
  } catch (error) {
    console.error("POST /api/servers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

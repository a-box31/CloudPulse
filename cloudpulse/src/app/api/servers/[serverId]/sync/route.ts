import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/servers/[serverId]/sync
 * Bulk sync file metadata from the Express backend.
 * Authenticated via X-Server-Key header.
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

    const { files } = await request.json();

    if (!Array.isArray(files)) {
      return NextResponse.json(
        { error: "files must be an array" },
        { status: 400 }
      );
    }

    // Upsert file entries in batches
    let synced = 0;
    for (const file of files) {
      await prisma.fileEntry.upsert({
        where: {
          serverId_path: { serverId, path: file.path },
        },
        create: {
          serverId,
          path: file.path,
          name: file.name,
          isDirectory: file.isDirectory ?? false,
          mimeType: file.mimeType ?? null,
          sizeBytes: file.sizeBytes != null ? BigInt(file.sizeBytes) : null,
          modifiedAt: file.modifiedAt ? new Date(file.modifiedAt) : null,
          parentPath: file.parentPath ?? null,
        },
        update: {
          name: file.name,
          isDirectory: file.isDirectory ?? false,
          mimeType: file.mimeType ?? null,
          sizeBytes: file.sizeBytes != null ? BigInt(file.sizeBytes) : null,
          modifiedAt: file.modifiedAt ? new Date(file.modifiedAt) : null,
          parentPath: file.parentPath ?? null,
          indexedAt: new Date(),
        },
      });
      synced++;
    }

    return NextResponse.json({ synced });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

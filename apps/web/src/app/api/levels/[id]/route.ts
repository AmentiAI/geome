import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { levels, levelData, users } from "@/lib/db/schema";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [level] = await db
    .select({
      id: levels.id,
      name: levels.name,
      description: levels.description,
      difficulty: levels.difficulty,
      settings: levels.settings,
      published: levels.published,
      featured: levels.featured,
      likes: levels.likes,
      downloads: levels.downloads,
      completions: levels.completions,
      createdAt: levels.createdAt,
      creatorId: levels.creatorId,
      creatorUsername: users.username,
    })
    .from(levels)
    .leftJoin(users, eq(levels.creatorId, users.id))
    .where(eq(levels.id, id))
    .limit(1);

  if (!level) return new NextResponse("Not found", { status: 404 });

  const [data] = await db.select().from(levelData).where(eq(levelData.levelId, id)).limit(1);

  // Track download (best-effort)
  await db
    .update(levels)
    .set({ downloads: (level.downloads ?? 0) + 1 })
    .where(eq(levels.id, id));

  return NextResponse.json({
    level,
    data: data
      ? {
          schemaVersion: data.schemaVersion,
          name: level.name,
          description: level.description,
          creatorId: level.creatorId,
          difficulty: level.difficulty,
          settings: level.settings,
          objects: data.objects,
        }
      : null,
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const [existing] = await db
    .select({ creatorId: levels.creatorId })
    .from(levels)
    .where(eq(levels.id, id))
    .limit(1);
  if (!existing) return new NextResponse("Not found", { status: 404 });

  if (existing.creatorId !== userId && !(await isAdmin(userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await db.delete(levels).where(eq(levels.id, id));
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { levelLikes, levels } from "@/lib/db/schema";
import { z } from "zod";

const Body = z.object({ value: z.union([z.literal(1), z.literal(-1), z.literal(0)]) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id: levelId } = await params;
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) return new NextResponse("Invalid", { status: 400 });

  const value = parsed.data.value;

  if (value === 0) {
    await db.delete(levelLikes).where(and(eq(levelLikes.levelId, levelId), eq(levelLikes.userId, userId)));
  } else {
    await db
      .insert(levelLikes)
      .values({ levelId, userId, value })
      .onConflictDoUpdate({
        target: [levelLikes.levelId, levelLikes.userId],
        set: { value },
      });
  }

  // Recompute aggregates
  const [{ likes, dislikes }] = await db
    .select({
      likes: sql<number>`count(*) filter (where value = 1)::int`,
      dislikes: sql<number>`count(*) filter (where value = -1)::int`,
    })
    .from(levelLikes)
    .where(eq(levelLikes.levelId, levelId));

  await db.update(levels).set({ likes, dislikes }).where(eq(levels.id, levelId));

  return NextResponse.json({ likes, dislikes });
}

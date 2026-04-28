import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { scores, users } from "@/lib/db/schema";

export async function GET(_req: Request, { params }: { params: Promise<{ levelId: string }> }) {
  const { levelId } = await params;
  const rows = await db
    .select({
      username: users.username,
      percent: scores.percent,
      attempts: scores.attempts,
      achievedAt: scores.achievedAt,
    })
    .from(scores)
    .innerJoin(users, eq(scores.userId, users.id))
    .where(eq(scores.levelId, levelId))
    .orderBy(desc(scores.percent))
    .limit(100);

  const entries = rows.map((r, i) => ({
    rank: i + 1,
    username: r.username,
    avatarUrl: null,
    percent: r.percent,
    attempts: r.attempts,
    achievedAt: r.achievedAt.toISOString(),
  }));
  return NextResponse.json({ entries });
}

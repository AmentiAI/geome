import { NextResponse } from "next/server";
import { eq, asc, desc, and, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { scores, users } from "@/lib/db/schema";

export async function GET(req: Request, { params }: { params: Promise<{ levelId: string }> }) {
  const { levelId } = await params;
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") === "time" ? "time" : "percent";

  const where =
    mode === "time"
      ? and(eq(scores.levelId, levelId), gte(scores.percent, 100))
      : eq(scores.levelId, levelId);

  const orderBy = mode === "time" ? [asc(scores.durationMs)] : [desc(scores.percent), asc(scores.durationMs)];

  const rows = await db
    .select({
      username: users.username,
      percent: scores.percent,
      attempts: scores.attempts,
      durationMs: scores.durationMs,
      achievedAt: scores.achievedAt,
    })
    .from(scores)
    .innerJoin(users, eq(scores.userId, users.id))
    .where(where)
    .orderBy(...orderBy)
    .limit(100);

  const entries = rows.map((r, i) => ({
    rank: i + 1,
    username: r.username,
    avatarUrl: null,
    percent: r.percent,
    attempts: r.attempts,
    durationMs: r.durationMs,
    achievedAt: r.achievedAt.toISOString(),
  }));
  return NextResponse.json({ mode, entries });
}

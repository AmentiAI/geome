import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { weeklyChallenges, levels, users } from "@/lib/db/schema";

function startOfWeekUTC(d: Date): Date {
  const day = d.getUTCDay();
  const diff = (day + 6) % 7; // Monday-aligned
  const start = new Date(d);
  start.setUTCDate(d.getUTCDate() - diff);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export async function GET() {
  const start = startOfWeekUTC(new Date());

  const [row] = await db
    .select({
      challengeId: weeklyChallenges.id,
      weekStart: weeklyChallenges.weekStart,
      rewardCoins: weeklyChallenges.rewardCoins,
      level: {
        id: levels.id,
        name: levels.name,
        difficulty: levels.difficulty,
        thumbnailUrl: levels.thumbnailUrl,
      },
      creator: users.username,
    })
    .from(weeklyChallenges)
    .innerJoin(levels, eq(weeklyChallenges.levelId, levels.id))
    .leftJoin(users, eq(levels.creatorId, users.id))
    .where(eq(weeklyChallenges.weekStart, start))
    .limit(1);

  if (!row) return NextResponse.json({ weekly: null });
  return NextResponse.json({ weekly: row });
}

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { dailyChallenges, levels, users } from "@/lib/db/schema";

export async function GET() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [row] = await db
    .select({
      challengeId: dailyChallenges.id,
      activeOn: dailyChallenges.activeOn,
      rewardCoins: dailyChallenges.rewardCoins,
      level: {
        id: levels.id,
        name: levels.name,
        difficulty: levels.difficulty,
        thumbnailUrl: levels.thumbnailUrl,
      },
      creator: users.username,
    })
    .from(dailyChallenges)
    .innerJoin(levels, eq(dailyChallenges.levelId, levels.id))
    .leftJoin(users, eq(levels.creatorId, users.id))
    .where(eq(dailyChallenges.activeOn, today))
    .limit(1);

  if (!row) return NextResponse.json({ daily: null });
  return NextResponse.json({ daily: row });
}

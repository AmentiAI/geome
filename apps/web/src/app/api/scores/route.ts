import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { scores, levels, profiles } from "@/lib/db/schema";
import { SubmitScoreRequest } from "@geome/shared";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const parsed = SubmitScoreRequest.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid score payload", issues: parsed.error.format() }, { status: 400 });
  }
  const { levelId, percent, attempts, durationMs, coinsCollected, practice } = parsed.data;

  // Keep the user's best non-practice score
  if (!practice) {
    await db
      .insert(scores)
      .values({ levelId, userId, percent, attempts, durationMs, coinsCollected, practice })
      .onConflictDoUpdate({
        target: [scores.levelId, scores.userId],
        set: {
          percent: sql`GREATEST(${scores.percent}, EXCLUDED.percent)`,
          attempts: sql`${scores.attempts} + EXCLUDED.attempts`,
          durationMs: sql`${scores.durationMs} + EXCLUDED.duration_ms`,
          coinsCollected: sql`GREATEST(${scores.coinsCollected}, EXCLUDED.coins_collected)`,
          achievedAt: sql`now()`,
        },
      });

    if (percent >= 100) {
      await db
        .update(levels)
        .set({ completions: sql`${levels.completions} + 1` })
        .where(eq(levels.id, levelId));

      const [lvl] = await db.select({ stars: levels.stars }).from(levels).where(eq(levels.id, levelId)).limit(1);
      const stars = lvl?.stars ?? 0;
      if (stars > 0) {
        await db
          .update(profiles)
          .set({
            starsCollected: sql`${profiles.starsCollected} + ${stars}`,
            coinsCollected: sql`${profiles.coinsCollected} + ${coinsCollected}`,
          })
          .where(eq(profiles.userId, userId));
      }
    }
  }

  return NextResponse.json({ ok: true });
}

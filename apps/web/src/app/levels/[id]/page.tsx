import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db/client";
import { levels, users, scores } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { Heart, Download, Play } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { LeaderboardEntry } from "@geome/shared";

export const dynamic = "force-dynamic";

async function load(id: string) {
  try {
    const [level] = await db
      .select({
        id: levels.id,
        name: levels.name,
        description: levels.description,
        difficulty: levels.difficulty,
        likes: levels.likes,
        downloads: levels.downloads,
        completions: levels.completions,
        thumbnailUrl: levels.thumbnailUrl,
        featured: levels.featured,
        createdAt: levels.createdAt,
        creatorUsername: users.username,
      })
      .from(levels)
      .leftJoin(users, eq(levels.creatorId, users.id))
      .where(eq(levels.id, id))
      .limit(1);
    if (!level) return null;

    const top = await db
      .select({
        username: users.username,
        avatarUrl: users.id,
        percent: scores.percent,
        attempts: scores.attempts,
        achievedAt: scores.achievedAt,
      })
      .from(scores)
      .innerJoin(users, eq(scores.userId, users.id))
      .where(eq(scores.levelId, id))
      .orderBy(desc(scores.percent))
      .limit(20);

    const entries: LeaderboardEntry[] = top.map((r, i) => ({
      rank: i + 1,
      username: r.username,
      avatarUrl: null,
      percent: r.percent,
      attempts: r.attempts,
      achievedAt: r.achievedAt.toISOString(),
    }));

    return { level, entries };
  } catch {
    return null;
  }
}

export default async function LevelDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await load(id);
  if (!data) notFound();

  const { level, entries } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge>{level.difficulty}</Badge>
          {level.featured && <Badge variant="accent" className="ml-2">Featured</Badge>}
          <h1 className="mt-2 text-3xl font-bold">{level.name}</h1>
          <p className="text-sm text-muted-foreground">
            by {level.creatorUsername ?? "unknown"} · {formatRelativeTime(level.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/play?level=${level.id}`}>
              <Play className="mr-1 h-4 w-4" /> Play
            </Link>
          </Button>
          <Button variant="outline">
            <Heart className="mr-1 h-4 w-4" /> {level.likes}
          </Button>
        </div>
      </div>

      {level.description && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">{level.description}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaderboardTable entries={entries} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Likes</span>
              <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{level.likes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Downloads</span>
              <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" />{level.downloads}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Completions</span>
              <span>{level.completions}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

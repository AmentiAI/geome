import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { users, profiles, levels } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LevelCard } from "@/components/level-card";
import type { LevelSummary } from "@geome/shared";

export const dynamic = "force-dynamic";

async function load(username: string) {
  try {
    const u = await db.query.users.findFirst({
      where: eq(users.username, username.toLowerCase()),
      with: { profile: true },
    });
    if (!u) return null;
    const created = await db
      .select({
        id: levels.id,
        name: levels.name,
        difficulty: levels.difficulty,
        likes: levels.likes,
        downloads: levels.downloads,
        thumbnailUrl: levels.thumbnailUrl,
        featured: levels.featured,
        createdAt: levels.createdAt,
      })
      .from(levels)
      .where(eq(levels.creatorId, u.id))
      .orderBy(desc(levels.createdAt))
      .limit(24);
    const summaries: LevelSummary[] = created.map((c) => ({
      id: c.id,
      name: c.name,
      difficulty: c.difficulty,
      likes: c.likes,
      downloads: c.downloads,
      thumbnailUrl: c.thumbnailUrl,
      featured: c.featured,
      createdAt: c.createdAt.toISOString(),
      creatorUsername: u.username,
    }));
    return { user: u, summaries };
  } catch {
    return null;
  }
}

export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await load(username);
  if (!data) notFound();
  const { user, summaries } = data;
  const p = user.profile;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <div
            className="grid h-20 w-20 place-items-center rounded-full text-2xl font-bold"
            style={{ background: p?.primaryColor ?? "#22d3ee" }}
          >
            {user.username[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            {p?.bio && <p className="mt-1 text-sm text-muted-foreground">{p.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>⭐ {p?.starsCollected ?? 0} stars</span>
              <span>🪙 {p?.coinsCollected ?? 0} coins</span>
              <span>👹 {p?.demonsBeaten ?? 0} demons</span>
              <span>🛠 {p?.creatorPoints ?? 0} creator pts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Created levels</CardTitle>
        </CardHeader>
        <CardContent>
          {summaries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No levels published yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {summaries.map((l) => (
                <LevelCard key={l.id} level={l} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

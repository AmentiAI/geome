import { db } from "@/lib/db/client";
import { levels, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { LevelCard } from "@/components/level-card";
import type { LevelSummary } from "@geome/shared";

export const metadata = { title: "Levels — geome" };
export const dynamic = "force-dynamic";

async function fetchLevels(): Promise<LevelSummary[]> {
  try {
    const rows = await db
      .select({
        id: levels.id,
        name: levels.name,
        difficulty: levels.difficulty,
        likes: levels.likes,
        downloads: levels.downloads,
        thumbnailUrl: levels.thumbnailUrl,
        featured: levels.featured,
        createdAt: levels.createdAt,
        creatorUsername: users.username,
      })
      .from(levels)
      .leftJoin(users, eq(levels.creatorId, users.id))
      .where(eq(levels.published, true))
      .orderBy(desc(levels.featured), desc(levels.likes))
      .limit(48);

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      difficulty: r.difficulty,
      likes: r.likes,
      downloads: r.downloads,
      thumbnailUrl: r.thumbnailUrl,
      featured: r.featured,
      createdAt: r.createdAt.toISOString(),
      creatorUsername: r.creatorUsername ?? "unknown",
    }));
  } catch {
    return [];
  }
}

export default async function LevelsPage() {
  const items = await fetchLevels();
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Levels</h1>
          <p className="text-muted-foreground">Community-built levels — featured first, then by hype.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No levels published yet. Run the database migrations and publish your first level from the editor.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((l) => (
            <LevelCard key={l.id} level={l} />
          ))}
        </div>
      )}
    </div>
  );
}

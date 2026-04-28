import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { desc, eq, and, ilike, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { levels, levelData, users } from "@/lib/db/schema";
import { getOrCreateLocalUser } from "@/lib/auth";
import { PublishLevelRequest } from "@geome/shared";

export const runtime = "nodejs";

const SORTS = {
  trending: [desc(levels.likes), desc(levels.publishedAt)],
  newest: [desc(levels.publishedAt)],
  featured: [desc(levels.featured), desc(levels.likes)],
} as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sort = (searchParams.get("sort") ?? "trending") as keyof typeof SORTS;
  const q = searchParams.get("q")?.trim();
  const difficulty = searchParams.get("difficulty");
  const limit = Math.min(Number(searchParams.get("limit") ?? 24), 100);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);

  const where = [eq(levels.published, true)];
  if (q) where.push(ilike(levels.name, `%${q}%`));
  if (difficulty) where.push(sql`${levels.difficulty}::text = ${difficulty}`);

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
    .where(and(...where))
    .orderBy(...(SORTS[sort] ?? SORTS.trending))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ items: rows });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const localUser = await getOrCreateLocalUser();
  if (!localUser) return new NextResponse("User not provisioned", { status: 500 });

  const body = await req.json();
  const parsed = PublishLevelRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid level payload", issues: parsed.error.format() }, { status: 400 });
  }
  const { data } = parsed.data;

  const [created] = await db
    .insert(levels)
    .values({
      creatorId: localUser.id,
      name: data.name,
      description: data.description ?? null,
      difficulty: data.difficulty,
      settings: data.settings,
      published: true,
      moderationStatus: "approved",
      publishedAt: new Date(),
    })
    .returning({ id: levels.id });

  await db.insert(levelData).values({
    levelId: created.id,
    schemaVersion: data.schemaVersion,
    objects: data.objects,
    objectCount: data.objects.length,
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}

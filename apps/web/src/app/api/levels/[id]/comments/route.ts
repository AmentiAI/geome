import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { levelComments, users } from "@/lib/db/schema";
import { z } from "zod";

const Body = z.object({
  body: z.string().min(1).max(800),
  percent: z.number().min(0).max(100).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db
    .select({
      id: levelComments.id,
      body: levelComments.body,
      percent: levelComments.percent,
      pinned: levelComments.pinned,
      createdAt: levelComments.createdAt,
      username: users.username,
    })
    .from(levelComments)
    .innerJoin(users, eq(levelComments.userId, users.id))
    .where(eq(levelComments.levelId, id))
    .orderBy(desc(levelComments.pinned), desc(levelComments.createdAt))
    .limit(100);
  return NextResponse.json({ comments: rows });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) return new NextResponse("Invalid", { status: 400 });

  const [created] = await db
    .insert(levelComments)
    .values({ levelId: id, userId, body: parsed.data.body, percent: parsed.data.percent })
    .returning();
  return NextResponse.json({ comment: created }, { status: 201 });
}

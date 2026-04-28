import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { levels, adminActions } from "@/lib/db/schema";
import { isAdmin } from "@/lib/auth";
import { z } from "zod";

const Body = z.object({
  action: z.enum(["feature", "unfeature", "approve", "remove", "set_stars"]),
  stars: z.number().int().min(0).max(10).optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  if (!(await isAdmin(userId))) return new NextResponse("Forbidden", { status: 403 });

  const { id } = await params;
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return new NextResponse("Invalid", { status: 400 });

  const updates: Partial<typeof levels.$inferInsert> = {};
  switch (parsed.data.action) {
    case "feature":
      updates.featured = true;
      break;
    case "unfeature":
      updates.featured = false;
      break;
    case "approve":
      updates.moderationStatus = "approved";
      updates.published = true;
      break;
    case "remove":
      updates.moderationStatus = "removed";
      updates.published = false;
      break;
    case "set_stars":
      updates.stars = parsed.data.stars ?? 0;
      break;
  }

  await db.update(levels).set(updates).where(eq(levels.id, id));
  await db.insert(adminActions).values({
    adminId: userId,
    action: parsed.data.action,
    targetType: "level",
    targetId: id,
    notes: parsed.data.notes,
  });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users, adminActions } from "@/lib/db/schema";
import { isAdmin } from "@/lib/auth";
import { z } from "zod";

const Body = z.object({ banned: z.boolean(), reason: z.string().max(500).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  if (!(await isAdmin(userId))) return new NextResponse("Forbidden", { status: 403 });

  const { id } = await params;
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return new NextResponse("Invalid", { status: 400 });

  await db
    .update(users)
    .set({ banned: parsed.data.banned, bannedReason: parsed.data.reason ?? null })
    .where(eq(users.id, id));

  await db.insert(adminActions).values({
    adminId: userId,
    action: parsed.data.banned ? "ban_user" : "unban_user",
    targetType: "user",
    targetId: id,
    notes: parsed.data.reason,
  });

  return NextResponse.json({ ok: true });
}

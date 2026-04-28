import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { levelReports } from "@/lib/db/schema";
import { z } from "zod";

const Body = z.object({
  reason: z.enum(["broken", "offensive", "stolen", "spam", "other"]),
  notes: z.string().max(1000).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return new NextResponse("Invalid", { status: 400 });

  const rows = await db
    .insert(levelReports)
    .values({ levelId: id, reporterId: userId, reason: parsed.data.reason, notes: parsed.data.notes })
    .returning();
  const r = rows[0];
  if (!r) return new NextResponse("Insert failed", { status: 500 });
  return NextResponse.json({ id: r.id }, { status: 201 });
}

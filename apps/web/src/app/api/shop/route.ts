import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cosmetics } from "@/lib/db/schema";

export async function GET() {
  const items = await db.select().from(cosmetics).where(eq(cosmetics.enabled, true));
  return NextResponse.json({ items });
}

import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users, profiles } from "@/lib/db/schema";
import { env } from "@/lib/env";

export const runtime = "nodejs";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    username?: string;
  };
}

export async function POST(req: Request) {
  const secret = env.CLERK_WEBHOOK_SECRET();
  if (!secret) return new NextResponse("Webhook secret not configured", { status: 503 });

  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };
  const body = await req.text();

  let evt: ClerkWebhookEvent;
  try {
    evt = new Webhook(secret).verify(body, headers) as ClerkWebhookEvent;
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const id = evt.data.id;
  const email = evt.data.email_addresses?.[0]?.email_address ?? `${id}@unknown.local`;
  const username = (evt.data.username ?? `player_${id.slice(-6)}`).toLowerCase();

  if (evt.type === "user.created") {
    await db.insert(users).values({ id, email, username }).onConflictDoNothing();
    await db.insert(profiles).values({ userId: id }).onConflictDoNothing();
  } else if (evt.type === "user.updated") {
    await db.update(users).set({ email, username, updatedAt: new Date() }).where(eq(users.id, id));
  } else if (evt.type === "user.deleted") {
    await db.delete(users).where(eq(users.id, id));
  }

  return NextResponse.json({ ok: true });
}

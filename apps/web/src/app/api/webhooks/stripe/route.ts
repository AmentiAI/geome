import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { purchases, userCosmetics } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = env.STRIPE_WEBHOOK_SECRET();
  if (!secret) return new NextResponse("Webhook secret not configured", { status: 503 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature", { status: 400 });

  const raw = await req.text();
  let event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return new NextResponse(`Webhook error: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; metadata?: Record<string, string> };
    const sessionId = session.id;

    const [purchase] = await db
      .update(purchases)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(purchases.stripeSessionId, sessionId))
      .returning();

    const cosmeticIds = (session.metadata?.cosmeticIds ?? "").split(",").filter(Boolean);
    if (purchase && cosmeticIds.length > 0) {
      await db
        .insert(userCosmetics)
        .values(cosmeticIds.map((id) => ({ userId: purchase.userId, cosmeticId: id, purchaseId: purchase.id })))
        .onConflictDoNothing();
    }
  }

  return NextResponse.json({ ok: true });
}

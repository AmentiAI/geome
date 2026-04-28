import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cosmetics, purchases } from "@/lib/db/schema";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { z } from "zod";

const Body = z.object({ cosmeticIds: z.array(z.string().uuid()).min(1).max(10) });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  if (!stripeConfigured()) return new NextResponse("Stripe not configured", { status: 503 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return new NextResponse("Invalid", { status: 400 });

  const items = await db
    .select()
    .from(cosmetics)
    .where(inArray(cosmetics.id, parsed.data.cosmeticIds));

  const purchasable = items.filter((i) => i.priceCents != null && i.stripePriceId);
  if (purchasable.length === 0) return new NextResponse("No purchasable items", { status: 400 });

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: purchasable.map((p) => ({ price: p.stripePriceId!, quantity: 1 })),
    metadata: { userId, cosmeticIds: parsed.data.cosmeticIds.join(",") },
    success_url: `${req.headers.get("origin")}/shop?status=success`,
    cancel_url: `${req.headers.get("origin")}/shop?status=cancel`,
  });

  await db.insert(purchases).values({
    userId,
    stripeSessionId: session.id,
    amountCents: purchasable.reduce((s, p) => s + (p.priceCents ?? 0), 0),
    items: purchasable.map((p) => ({ cosmeticId: p.id, qty: 1, priceCents: p.priceCents })),
  });

  return NextResponse.json({ url: session.url });
}

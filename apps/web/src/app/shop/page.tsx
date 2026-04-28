import { db } from "@/lib/db/client";
import { cosmetics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Shop — geome" };
export const dynamic = "force-dynamic";

async function listShop() {
  try {
    return await db.select().from(cosmetics).where(eq(cosmetics.enabled, true));
  } catch {
    return [];
  }
}

function priceLabel(cents: number | null) {
  if (cents == null) return "Earned";
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function Shop() {
  const items = await listShop();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shop</h1>
        <p className="text-muted-foreground">Cosmetics only — no pay-to-win.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No items yet. Seed the cosmetics table to populate the shop.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((c) => (
            <Card key={c.id}>
              <CardContent className="space-y-3 p-4">
                <div className="grid aspect-square place-items-center rounded-md bg-muted">
                  <span className="text-3xl">🎨</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{c.displayName}</h3>
                    <p className="text-xs text-muted-foreground">{c.kind}</p>
                  </div>
                  <Badge variant={c.rarity === "legendary" ? "accent" : "secondary"}>{c.rarity}</Badge>
                </div>
                <Button className="w-full" disabled={c.priceCents == null}>
                  {priceLabel(c.priceCents)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

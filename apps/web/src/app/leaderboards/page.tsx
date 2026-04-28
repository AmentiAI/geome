import { db } from "@/lib/db/client";
import { profiles, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Leaderboards — geome" };
export const dynamic = "force-dynamic";

async function topByStars() {
  try {
    const rows = await db
      .select({
        username: users.username,
        starsCollected: profiles.starsCollected,
        coinsCollected: profiles.coinsCollected,
        demonsBeaten: profiles.demonsBeaten,
        creatorPoints: profiles.creatorPoints,
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .orderBy(desc(profiles.starsCollected))
      .limit(50);
    return rows;
  } catch {
    return [];
  }
}

export default async function Leaderboards() {
  const rows = await topByStars();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Global leaderboard</h1>
        <p className="text-muted-foreground">Ranked by stars earned across all levels.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top players</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              No data yet. Play levels and earn stars to appear here.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Player</th>
                  <th className="px-3 py-2">Stars</th>
                  <th className="px-3 py-2">Coins</th>
                  <th className="px-3 py-2">Demons</th>
                  <th className="px-3 py-2">Creator pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.username} className="border-t border-border">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{r.username}</td>
                    <td className="px-3 py-2">{r.starsCollected}</td>
                    <td className="px-3 py-2">{r.coinsCollected}</td>
                    <td className="px-3 py-2">{r.demonsBeaten}</td>
                    <td className="px-3 py-2">{r.creatorPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

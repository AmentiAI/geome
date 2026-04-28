import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { levels, levelReports, users } from "@/lib/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function load() {
  const [pendingLevels, openReports, userCount] = await Promise.all([
    db
      .select({ id: levels.id, name: levels.name, createdAt: levels.createdAt, creator: users.username })
      .from(levels)
      .leftJoin(users, eq(levels.creatorId, users.id))
      .where(eq(levels.moderationStatus, "pending"))
      .orderBy(desc(levels.createdAt))
      .limit(50),
    db
      .select({
        id: levelReports.id,
        reason: levelReports.reason,
        notes: levelReports.notes,
        createdAt: levelReports.createdAt,
        levelId: levelReports.levelId,
        levelName: levels.name,
      })
      .from(levelReports)
      .leftJoin(levels, eq(levelReports.levelId, levels.id))
      .where(and(isNull(levelReports.resolvedAt)))
      .orderBy(desc(levelReports.createdAt))
      .limit(50),
    db.$count(users),
  ]);
  return { pendingLevels, openReports, userCount };
}

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!(await isAdmin(userId))) redirect("/");

  let data: Awaited<ReturnType<typeof load>> = { pendingLevels: [], openReports: [], userCount: 0 };
  try {
    data = await load();
  } catch {
    /* empty DB */
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="text-muted-foreground">Moderation, reports, featured levels.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Users" value={data.userCount} />
        <StatCard label="Pending levels" value={data.pendingLevels.length} />
        <StatCard label="Open reports" value={data.openReports.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending moderation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.pendingLevels.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing to review.</p>
          ) : (
            data.pendingLevels.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                <div>
                  <p className="font-medium">{l.name}</p>
                  <p className="text-xs text-muted-foreground">by {l.creator ?? "unknown"}</p>
                </div>
                <Badge variant="secondary">pending</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.openReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open reports.</p>
          ) : (
            data.openReports.map((r) => (
              <div key={r.id} className="rounded-md border border-border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.levelName ?? r.levelId}</p>
                  <Badge variant="destructive">{r.reason}</Badge>
                </div>
                {r.notes && <p className="mt-1 text-xs text-muted-foreground">{r.notes}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayShell } from "@/components/play-shell";

export const metadata = { title: "Play — geome" };
export const dynamic = "force-dynamic";

const SYSTEM_LEVELS = [
  {
    slug: "tutorial",
    name: "Tutorial",
    blurb: "Learn the basics — tap to jump.",
    difficulty: "easy",
  },
  {
    slug: "level-2",
    name: "Neon Drift",
    blurb: "Faster, longer, gravity flips. Don't blink.",
    difficulty: "normal",
  },
] as const;

function buildExists(): boolean {
  try {
    return existsSync(path.join(process.cwd(), "public", "game", "index.html"));
  } catch {
    return false;
  }
}

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const hasBuild = buildExists();

  if (!level) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Play</h1>
          <p className="text-muted-foreground">Pick a level. Times are recorded to the leaderboard.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SYSTEM_LEVELS.map((l) => (
            <Card key={l.slug} className="transition hover:border-primary/40">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{l.name}</h2>
                  <Badge variant="secondary">{l.difficulty}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{l.blurb}</p>
                <Button asChild className="self-start">
                  <Link href={`/play?level=local:${l.slug}`}>Play</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
          Looking for community levels?{" "}
          <Link href="/levels" className="text-primary underline-offset-4 hover:underline">
            Browse the catalog →
          </Link>
        </div>
      </div>
    );
  }

  const localSlug = level.startsWith("local:") ? level.slice(6) : null;
  const systemIndex = localSlug ? SYSTEM_LEVELS.findIndex((l) => l.slug === localSlug) : -1;
  const systemLevel = systemIndex >= 0 ? SYSTEM_LEVELS[systemIndex] : null;
  const nextSystem = systemIndex >= 0 ? SYSTEM_LEVELS[systemIndex + 1] ?? null : null;
  const levelName = systemLevel?.name ?? "Custom level";
  const src = `/game/index.html?level=${encodeURIComponent(level)}`;
  const nextLevelHref = nextSystem ? `/play?level=local:${nextSystem.slug}` : null;
  const nextLevelName = nextSystem?.name ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{levelName}</h1>
          <p className="text-muted-foreground">Beat the level. Your best time goes to the board.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/play">Back to levels</Link>
        </Button>
      </div>

      <PlayShell
        src={src}
        levelId={level}
        levelName={levelName}
        hasBuild={hasBuild}
        nextLevelHref={nextLevelHref}
        nextLevelName={nextLevelName}
      />

      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-0">
        <p className="text-sm text-muted-foreground">
          Native builds for Windows, Mac, and mobile follow the same source. See the README for export presets.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/levels">Browse community levels</Link>
        </Button>
      </CardContent>
    </div>
  );
}

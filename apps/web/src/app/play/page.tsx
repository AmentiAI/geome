import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Play — geome" };
export const dynamic = "force-dynamic";

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
  const src = level ? `/game/index.html?level=${encodeURIComponent(level)}` : `/game/index.html`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Play</h1>
        <p className="text-muted-foreground">The web build runs in your browser via Godot&apos;s HTML5 export.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="grid-bg flex aspect-video w-full items-center justify-center">
          {hasBuild ? (
            <iframe
              src={src}
              title="geome"
              className="h-full w-full border-0"
              allow="autoplay; fullscreen; gamepad; cross-origin-isolated"
            />
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-sm uppercase tracking-wider text-muted-foreground">Godot HTML5 build placeholder</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Export <code className="rounded bg-muted px-1">apps/game</code> to{" "}
                <code className="rounded bg-muted px-1">apps/web/public/game/</code> and the embed appears here.
              </p>
            </div>
          )}
        </div>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted-foreground">
            Native builds for Windows, Mac, and mobile follow the same source. See the README for export presets.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/levels">Browse community levels</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

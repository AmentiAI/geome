"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LevelCompleteOverlay } from "@/components/level-complete-overlay";

type Props = {
  src: string;
  levelId: string;
  levelName: string;
  hasBuild: boolean;
  nextLevelHref?: string | null;
  nextLevelName?: string | null;
};

type CompleteEvent = {
  durationMs: number;
  coins: number;
};

export function PlayShell({ src, levelId, levelName, hasBuild, nextLevelHref, nextLevelName }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const [iframeKey, setIframeKey] = useState(0);
  const [complete, setComplete] = useState<CompleteEvent | null>(null);

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      const data = ev.data;
      if (!data || typeof data !== "object" || data.type !== "geome:levelComplete") return;
      if (data.practice) return;
      const reportedDuration = Number(data.durationMs);
      const fallbackDuration = Date.now() - startedAtRef.current;
      const durationMs = Number.isFinite(reportedDuration) && reportedDuration > 0 ? reportedDuration : fallbackDuration;
      setComplete({ durationMs, coins: Number(data.coins) || 0 });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const replay = useCallback(() => {
    setComplete(null);
    startedAtRef.current = Date.now();
    setIframeKey((k) => k + 1);
  }, []);

  const simulate = useCallback(() => {
    const durationMs = Date.now() - startedAtRef.current;
    setComplete({ durationMs: Math.max(durationMs, 1234), coins: 0 });
  }, []);

  return (
    <div className="relative">
      <div className="grid-bg flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
        {hasBuild ? (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={src}
            title={levelName}
            className="h-full w-full border-0"
            allow="autoplay; fullscreen; gamepad; cross-origin-isolated"
            onLoad={() => {
              startedAtRef.current = Date.now();
            }}
          />
        ) : (
          <div className="space-y-3 px-6 text-center">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">Godot HTML5 build placeholder</p>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              Export <code className="rounded bg-muted px-1">apps/game</code> to{" "}
              <code className="rounded bg-muted px-1">apps/web/public/game/</code> to play{" "}
              <span className="font-medium text-foreground">{levelName}</span> here.
            </p>
            <Button size="sm" variant="outline" onClick={simulate}>
              Preview win animation
            </Button>
          </div>
        )}
        <LevelCompleteOverlay
          open={complete !== null}
          levelName={levelName}
          levelId={levelId}
          durationMs={complete?.durationMs ?? 0}
          coins={complete?.coins ?? 0}
          onClose={() => setComplete(null)}
          onReplay={replay}
          nextLevelHref={nextLevelHref ?? null}
          nextLevelName={nextLevelName ?? null}
        />
      </div>
    </div>
  );
}

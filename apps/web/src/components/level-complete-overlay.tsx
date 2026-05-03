"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  levelName: string;
  levelId: string;
  durationMs: number;
  coins?: number;
  onClose: () => void;
  onReplay: () => void;
  nextLevelHref?: string | null;
  nextLevelName?: string | null;
};

const PALETTE = [
  "hsl(186 94% 50%)",
  "hsl(280 80% 60%)",
  "hsl(320 90% 60%)",
  "hsl(46 100% 60%)",
  "hsl(140 80% 55%)",
];

const COUNT_UP_MS = 900;

function formatTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "--:--.---";
  const totalSeconds = ms / 1000;
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  const millis = Math.floor(ms % 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function useCountUp(target: number, active: boolean): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / COUNT_UP_MS);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return value;
}

export function LevelCompleteOverlay({
  open,
  levelName,
  levelId,
  durationMs,
  coins = 0,
  onClose,
  onReplay,
  nextLevelHref = null,
  nextLevelName = null,
}: Props) {
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const isLeaderboard = !levelId.startsWith("local:");
  const animatedMs = useCountUp(durationMs, open);

  useEffect(() => {
    if (!open) {
      setSubmitState("idle");
      return;
    }
    if (!isLeaderboard) {
      setSubmitState("saved");
      return;
    }
    let aborted = false;
    setSubmitState("saving");
    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        levelId,
        percent: 100,
        attempts: 1,
        durationMs: Math.max(0, Math.round(durationMs)),
        coinsCollected: Math.max(0, Math.min(3, coins | 0)),
        practice: false,
      }),
    })
      .then((r) => {
        if (aborted) return;
        setSubmitState(r.ok ? "saved" : "error");
      })
      .catch(() => {
        if (!aborted) setSubmitState("error");
      });
    return () => {
      aborted = true;
    };
  }, [open, levelId, durationMs, coins, isLeaderboard]);

  const confetti = useMemo(() => {
    if (!open) return [];
    return Array.from({ length: 120 }).map((_, i) => {
      const left = Math.random() * 100;
      const drift = (Math.random() - 0.5) * 40;
      const delay = Math.random() * 0.6;
      const duration = 1.6 + Math.random() * 1.8;
      const size = 6 + Math.random() * 10;
      const color = PALETTE[i % PALETTE.length];
      const shape = i % 3 === 0 ? "circle" : "square";
      return { left, drift, delay, duration, size, color, shape, key: i };
    });
  }, [open]);

  const sparkles = useMemo(() => {
    if (!open) return [];
    return Array.from({ length: 24 }).map((_, i) => {
      const left = 10 + Math.random() * 80;
      const top = 30 + Math.random() * 50;
      const driftX = (Math.random() - 0.5) * 40;
      const driftY = -20 - Math.random() * 60;
      const delay = Math.random() * 0.8;
      const duration = 1.2 + Math.random() * 1.0;
      const size = 4 + Math.random() * 6;
      const color = PALETTE[i % PALETTE.length];
      return { left, top, driftX, driftY, delay, duration, size, color, key: i };
    });
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 animate-backdrop-pulse backdrop-blur-md"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--primary) / 0.25) 0%, hsl(var(--background) / 0.75) 45%, hsl(var(--background) / 0.95) 100%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        {confetti.map((c) => (
          <span
            key={c.key}
            className="absolute top-0 block animate-confetti-fall"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.shape === "circle" ? c.size : c.size * 0.4,
              borderRadius: c.shape === "circle" ? "9999px" : "2px",
              background: c.color,
              boxShadow: `0 0 8px ${c.color}`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              ["--cx" as string]: `${c.drift}vw`,
            }}
          />
        ))}
        {sparkles.map((s) => (
          <span
            key={`sp-${s.key}`}
            className="absolute block animate-sparkle-float rounded-full"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              background: s.color,
              boxShadow: `0 0 12px ${s.color}, 0 0 24px ${s.color}`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
              ["--sx" as string]: `${s.driftX}vw`,
              ["--sy" as string]: `${s.driftY}vh`,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/70 animate-ring-burst" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-secondary/70 animate-ring-burst"
        style={{ animationDelay: "180ms" }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent/70 animate-ring-burst"
        style={{ animationDelay: "360ms" }}
      />

      <div className="relative w-[min(92%,540px)] animate-victory-pop overflow-hidden rounded-2xl border border-border bg-card/95 p-6 shadow-2xl shadow-primary/30 ring-1 ring-primary/40">
        <div className="pointer-events-none absolute inset-y-0 -inset-x-1 -z-10 animate-victory-shine bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Level Complete</p>
        <h2 className="mt-1 animate-title-glow text-3xl font-bold text-gradient">{levelName}</h2>

        <div
          className="mt-5 animate-fade-up rounded-xl border border-border bg-background/60 p-4"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Your time</p>
          <p className="mt-1 font-mono text-4xl font-bold tabular-nums">{formatTime(animatedMs)}</p>
          {coins > 0 && (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="inline-block h-3 w-3 animate-coin-spin rounded-full"
                style={{ background: "hsl(46 100% 60%)", boxShadow: "0 0 8px hsl(46 100% 60%)" }}
              />
              Coins: <span className="font-medium text-foreground">{coins}/3</span>
            </p>
          )}
        </div>

        <div className="mt-4 animate-fade-up text-sm" style={{ animationDelay: "400ms" }}>
          {submitState === "saving" && <p className="text-muted-foreground">Submitting your time…</p>}
          {submitState === "saved" && (
            <p className="text-primary">
              {isLeaderboard ? "Time recorded to leaderboard." : "Time recorded locally."}
            </p>
          )}
          {submitState === "error" && (
            <p className="text-destructive">Couldn&apos;t save your time. Sign in and try again.</p>
          )}
          {submitState === "idle" && <p className="text-muted-foreground">Preparing submission…</p>}
        </div>

        <div
          className="mt-6 flex flex-wrap gap-2 animate-fade-up"
          style={{ animationDelay: "550ms" }}
        >
          {nextLevelHref && nextLevelName ? (
            <Button asChild className="animate-next-pulse">
              <Link href={nextLevelHref}>Next: {nextLevelName} →</Link>
            </Button>
          ) : null}
          <Button onClick={onReplay} variant={nextLevelHref ? "outline" : "default"} className={nextLevelHref ? "" : "animate-pulse-glow"}>
            Play again
          </Button>
          {isLeaderboard ? (
            <Button asChild variant="outline">
              <Link href={`/levels/${levelId}`}>View leaderboard</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/leaderboards">Global leaderboard</Link>
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Dismiss</Button>
        </div>
      </div>
    </div>
  );
}

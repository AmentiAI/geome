"use client";
import * as React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EMPTY_LEVEL, type LevelData, type LevelObject, type ObjectType } from "@geome/shared";
import { Save, Trash2, Download, Play } from "lucide-react";

const TOOLS: { type: ObjectType; label: string; color: string }[] = [
  { type: "block", label: "Block", color: "#94a3b8" },
  { type: "spike", label: "Spike", color: "#ef4444" },
  { type: "jump_pad", label: "Jump pad", color: "#f59e0b" },
  { type: "jump_orb", label: "Jump orb", color: "#fbbf24" },
  { type: "portal_gravity", label: "Gravity portal", color: "#a855f7" },
  { type: "portal_speed", label: "Speed portal", color: "#22d3ee" },
  { type: "portal_mode", label: "Mode portal", color: "#ec4899" },
  { type: "coin", label: "Coin", color: "#facc15" },
  { type: "checkpoint", label: "Checkpoint", color: "#10b981" },
];

const GRID = 30;

export function EditorClient() {
  const [tool, setTool] = useState<ObjectType>("block");
  const [level, setLevel] = useState<LevelData>(() => ({ ...EMPTY_LEVEL, name: "My level" }));
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const snap = useCallback((x: number, y: number) => {
    return { x: Math.round(x / GRID) * GRID, y: Math.round(y / GRID) * GRID };
  }, []);

  const toLocal = useCallback((evt: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return snap(evt.clientX - rect.left, evt.clientY - rect.top);
  }, [snap]);

  const placeAt = useCallback(
    (evt: React.MouseEvent<SVGSVGElement>) => {
      const pt = toLocal(evt);
      if (!pt) return;
      setLevel((l) => ({
        ...l,
        objects: [...l.objects, { type: tool, x: pt.x, y: pt.y, rotation: 0, scale: 1 }],
      }));
    },
    [tool, toLocal],
  );

  const remove = (idx: number) =>
    setLevel((l) => ({ ...l, objects: l.objects.filter((_, i) => i !== idx) }));

  const clear = () => setLevel((l) => ({ ...l, objects: [] }));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(level, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${level.name.replace(/\s+/g, "_") || "level"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const publish = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/levels", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: level }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setStatusMsg(`Published! id=${json.id}`);
    } catch (e) {
      setStatusMsg(`Publish failed: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const colorFor = useMemo(() => {
    const map = new Map(TOOLS.map((t) => [t.type, t.color] as const));
    return (t: ObjectType) => map.get(t) ?? "#999";
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Level editor</h1>
          <p className="text-sm text-muted-foreground">
            Click the canvas to place objects. Right-click an object to remove it. {level.objects.length} objects.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={level.name}
            onChange={(e) => setLevel({ ...level, name: e.target.value })}
            className="w-48"
            placeholder="Level name"
          />
          <Button onClick={exportJson} variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" /> Export JSON
          </Button>
          <Button onClick={clear} variant="outline" size="sm">
            <Trash2 className="mr-1 h-4 w-4" /> Clear
          </Button>
          <Button onClick={publish} disabled={saving} size="sm">
            <Save className="mr-1 h-4 w-4" /> {saving ? "Publishing…" : "Publish"}
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="/play" target="_blank" rel="noopener">
              <Play className="mr-1 h-4 w-4" /> Test in game
            </a>
          </Button>
        </div>
      </div>

      {statusMsg && (
        <div className="rounded-md border border-border bg-card/50 px-3 py-2 text-sm">{statusMsg}</div>
      )}

      <div className="grid gap-4 lg:grid-cols-[200px,1fr]">
        <Card>
          <CardContent className="p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Tools</p>
            <div className="grid gap-1">
              {TOOLS.map((t) => (
                <button
                  key={t.type}
                  onClick={() => setTool(t.type)}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition ${
                    tool === t.type ? "bg-primary/15 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <span className="h-3 w-3 rounded-sm" style={{ background: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <svg
              ref={svgRef}
              viewBox="0 0 1200 480"
              className="grid-bg block aspect-[2.5/1] w-full cursor-crosshair rounded-md"
              onClick={placeAt}
              onMouseMove={(e) => setHover(toLocal(e))}
              onMouseLeave={() => setHover(null)}
            >
              {/* ground */}
              <line x1="0" y1="450" x2="1200" y2="450" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.5" />
              {level.objects.map((o, i) => (
                <ObjectGlyph
                  key={i}
                  obj={o}
                  color={colorFor(o.type)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    remove(i);
                  }}
                />
              ))}
              {hover && (
                <rect
                  x={hover.x - GRID / 2}
                  y={hover.y - GRID / 2}
                  width={GRID}
                  height={GRID}
                  fill={colorFor(tool)}
                  opacity="0.4"
                  pointerEvents="none"
                />
              )}
            </svg>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ObjectGlyph({
  obj,
  color,
  onContextMenu,
}: {
  obj: LevelObject;
  color: string;
  onContextMenu?: (e: React.MouseEvent<SVGGElement>) => void;
}) {
  const half = GRID / 2;
  if (obj.type === "spike") {
    return (
      <polygon
        onContextMenu={onContextMenu}
        points={`${obj.x - half},${obj.y + half} ${obj.x + half},${obj.y + half} ${obj.x},${obj.y - half}`}
        fill={color}
      />
    );
  }
  if (obj.type === "coin") {
    return (
      <circle onContextMenu={onContextMenu} cx={obj.x} cy={obj.y} r={half * 0.7} fill={color} />
    );
  }
  return (
    <g onContextMenu={onContextMenu}>
      <rect
        x={obj.x - half}
        y={obj.y - half}
        width={GRID}
        height={GRID}
        fill={color}
        rx={4}
      />
    </g>
  );
}

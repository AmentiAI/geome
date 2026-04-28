import Link from "next/link";
import Image from "next/image";
import { Heart, Download, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LevelSummary } from "@geome/shared";

const difficultyColor: Record<string, string> = {
  auto: "bg-emerald-500/20 text-emerald-300",
  easy: "bg-emerald-500/20 text-emerald-300",
  normal: "bg-sky-500/20 text-sky-300",
  hard: "bg-amber-500/20 text-amber-300",
  harder: "bg-orange-500/20 text-orange-300",
  insane: "bg-rose-500/20 text-rose-300",
  demon: "bg-fuchsia-500/20 text-fuchsia-300",
};

export function LevelCard({ level }: { level: LevelSummary }) {
  return (
    <Link href={`/levels/${level.id}`} className="group">
      <Card className="overflow-hidden transition-all group-hover:border-primary group-hover:shadow-[0_0_24px_hsl(var(--primary)/0.3)]">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {level.thumbnailUrl ? (
            <Image
              src={level.thumbnailUrl}
              alt={level.name}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="grid-bg h-full w-full" />
          )}
          {level.featured && (
            <Badge variant="accent" className="absolute left-2 top-2">
              <Star className="mr-1 h-3 w-3" /> Featured
            </Badge>
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold">{level.name}</h3>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${difficultyColor[level.difficulty] ?? difficultyColor.normal}`}
            >
              {level.difficulty}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">by {level.creatorUsername}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {level.likes}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" /> {level.downloads}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

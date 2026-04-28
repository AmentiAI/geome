import { Trophy, Medal } from "lucide-react";
import type { LeaderboardEntry } from "@geome/shared";

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        No scores yet — be the first to set a record.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-2.5">Rank</th>
            <th className="px-4 py-2.5">Player</th>
            <th className="px-4 py-2.5">Progress</th>
            <th className="hidden px-4 py-2.5 sm:table-cell">Attempts</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={`${e.rank}-${e.username}`} className="border-t border-border">
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {e.rank === 1 && <Trophy className="h-4 w-4 text-amber-300" />}
                  {e.rank === 2 && <Medal className="h-4 w-4 text-slate-300" />}
                  {e.rank === 3 && <Medal className="h-4 w-4 text-orange-400" />}
                  <span className="font-semibold">#{e.rank}</span>
                </div>
              </td>
              <td className="px-4 py-2.5">{e.username}</td>
              <td className="px-4 py-2.5 font-mono">{e.percent.toFixed(1)}%</td>
              <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{e.attempts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

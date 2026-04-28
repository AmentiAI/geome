import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">404</p>
        <h1 className="text-4xl font-bold">You fell off the map</h1>
        <p className="text-muted-foreground">That level doesn&apos;t exist (or got removed).</p>
        <Button asChild>
          <Link href="/levels">Browse levels</Link>
        </Button>
      </div>
    </div>
  );
}

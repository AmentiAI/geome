import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Gamepad2, Wrench, Trophy, Music2 } from "lucide-react";

const features = [
  { icon: Gamepad2, title: "Tight rhythm gameplay", body: "Sync every jump to the beat with frame-accurate physics." },
  { icon: Wrench, title: "Build your own", body: "Drag-and-drop level editor with triggers, portals, and groups." },
  { icon: Trophy, title: "Climb the boards", body: "Compete on every level and the daily and weekly challenges." },
  { icon: Music2, title: "Pick your soundtrack", body: "Choose from licensed tracks or upload your own with a beat grid." },
];

export default function Home() {
  return (
    <div className="space-y-24">
      <section className="grid-bg relative overflow-hidden rounded-3xl border border-border/60 px-6 py-20 text-center sm:py-28">
        <div className="relative z-10 mx-auto max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            in early access
          </span>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            <span className="text-gradient">geome</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            A rhythm platformer where the community builds the soundtrack and the levels. Jump in, or build the next demon.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="animate-pulse-glow">
              <Link href="/play">
                Play now <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/editor">Open editor</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardContent className="space-y-2 p-6">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center">
        <h2 className="text-2xl font-semibold">Ready to publish a level?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Sign up to share your creations, gather likes, and put your name on the daily challenge.
        </p>
        <Button asChild className="mt-4">
          <Link href="/sign-up">Create an account</Link>
        </Button>
      </section>
    </div>
  );
}

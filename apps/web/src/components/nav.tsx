import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";

const links = [
  { href: "/play", label: "Play" },
  { href: "/levels", label: "Levels" },
  { href: "/editor", label: "Editor" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/shop", label: "Shop" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Gamepad2 className="h-5 w-5 text-primary" />
          <span className="text-gradient text-lg">geome</span>
        </Link>
        <nav className="hidden gap-1 md:flex">
          {links.map((l) => (
            <Button key={l.href} asChild variant="ghost" size="sm">
              <Link href={l.href}>{l.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <SignedOut>
            <Button asChild variant="ghost" size="sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

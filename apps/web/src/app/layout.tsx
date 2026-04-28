import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "geome — rhythm platformer",
  description:
    "A community-driven rhythm platformer in the spirit of Geometry Dash. Play levels, create your own, climb the leaderboards.",
  metadataBase: new URL("https://geome.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="min-h-screen antialiased">
          <Nav />
          <main className="container mx-auto max-w-6xl px-4 py-8">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}

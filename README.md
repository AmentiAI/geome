# geome

A Geometry-Dash-style rhythm platformer. Community-driven levels, leaderboards,
cosmetics shop. Web build via Godot HTML5 export embedded in a Next.js site.

## Layout

```
.
├── apps/
│   ├── web/      Next.js 15 + Drizzle + Clerk + Stripe + Ably
│   └── game/     Godot 4 project (player, level loader, editor runtime)
└── packages/
    └── shared/   TypeScript level schema + API contracts (zod)
```

The shared package is the single source of truth for the level format. The web
app imports it as `@geome/shared`. The Godot client mirrors the schema in
`level_loader.gd` and consumes the same JSON.

## Stack

| Layer            | Choice                           |
|------------------|----------------------------------|
| Game engine      | Godot 4.3 (GDScript)             |
| Frontend         | Next.js 15 + TS + Tailwind + shadcn/ui |
| Database         | Neon Postgres                    |
| ORM              | Drizzle                          |
| Auth             | Clerk                            |
| File storage     | Cloudflare R2 (S3-compatible)    |
| Payments         | Stripe                           |
| Realtime         | Ably                             |
| Hosting          | Vercel (web), Godot exports for native |

## First-time setup

```bash
# 1. Install web dependencies
npm install

# 2. Copy and fill the env file
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your DATABASE_URL, Clerk keys, etc.
# A DATABASE_URL is already in the repo-root .env (Neon) — copy it over.

# 3. Generate and apply the schema
npm run db:generate -w @geome/web
npm run db:migrate  -w @geome/web      # or: npm run db:push -w @geome/web

# 4. Run the web app
npm run dev -w @geome/web              # http://localhost:3000
```

## Game

```bash
# Open in Godot 4.3+
godot apps/game/project.godot
# Press F5 to play the bundled tutorial level.
```

To export the web build into the Next.js site:

1. In Godot → Project → Export → Add → Web
2. Export path: `../../apps/web/public/game/index.html`
3. Click Export Project
4. Reload `/play` — the iframe placeholder is replaced by your build
   (uncomment the `<iframe>` in `apps/web/src/app/play/page.tsx`).

## What's wired vs. what's a stub

**Wired and ready:**
- Drizzle schema for every table (users, levels, scores, cosmetics, etc.)
- API routes for level CRUD, likes, comments, reports, scores, leaderboards,
  daily, weekly, shop, purchase, Clerk webhook, Stripe webhook, admin actions.
- Web pages: home, play, levels (browser + detail), editor, leaderboards,
  profile, shop, admin, sign-in/up.
- In-browser SVG level editor that publishes through `/api/levels`.
- Godot project with player physics, level loader, audio sync, in-game editor
  runtime, and tutorial level — all consuming the shared schema.
- Clerk middleware protecting `/profile`, `/editor`, `/admin`, etc.
- Stripe checkout session creation + webhook fulfillment of cosmetic items.

**Needs credentials before it does anything (clear errors thrown):**
- R2 presigned uploads (install `@aws-sdk/client-s3` and finish `lib/r2.ts`).
- Clerk webhook signature verification (set `CLERK_WEBHOOK_SECRET`).
- Stripe purchases (set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `stripePriceId` per cosmetic row).
- Ably realtime token (set `ABLY_API_KEY`).

**MVP gaps (intentionally small, pick up next):**
- Audio asset pipeline (`AudioSync.play_song` is wired; need uploader + storage).
- Full editor UI in the web app (current build is functional drag-and-drop;
  triggers, groups, copy/paste are scaffolded in the schema but not yet UI).
- Replays, friends list, season pass / battle pass UI.
- Native exports (project is ready; just add presets).

## Build order for shipping the MVP

1. Wire your real Clerk keys → publish a level end-to-end from `/editor`.
2. Export the Godot tutorial to `apps/web/public/game/`, embed in `/play`.
3. Seed `cosmetics` with a few items + Stripe Price IDs → test `/shop`.
4. Set up the Ably API key → live leaderboard updates on level pages.
5. Add a Vercel cron job that picks a daily/weekly level and inserts into
   `daily_challenges` / `weekly_challenges`.

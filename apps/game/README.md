# geome — game client (Godot 4)

Open `project.godot` in Godot 4.3+.

## Run

Press F5 (Play). The Main scene reads a `?level=<id>` query param when
running in the browser; otherwise it loads `levels/tutorial.json`.

## Architecture

- `scenes/` — Godot scene files (.tscn)
  - `Main.tscn` — entry point, picks a level
  - `Level.tscn` — owns the camera, player, objects, HUD
  - `Player.tscn` — `CharacterBody2D` with `player.gd`
  - `objects/` — Block, Spike, Portal, JumpPad, Coin, Checkpoint
  - `ui/HUD.tscn` — attempt counter and progress %
- `scripts/` — GDScript
  - `main.gd`, `level.gd`, `player.gd`, `level_loader.gd`, `hud.gd`
  - `game_state.gd` (autoload), `api_client.gd` (autoload), `audio_sync.gd` (autoload)
  - `editor_runtime.gd` — minimal in-game editor (test+publish loop)
  - `objects/*.gd` — per-object behavior
- `levels/tutorial.json` — bundled offline level matching the shared schema

## Level format

Levels are stored as JSON conforming to the schema in
`packages/shared/src/level-schema.ts`. The Godot client reads this format
directly via `level_loader.gd`. See `levels/tutorial.json` for an example.

## Web export

1. Project → Export → Add → Web
2. Set the export path to `../../apps/web/public/game/index.html`
3. Build — the Next.js `/play` page already references `/game/index.html`

## Native export

Add platform presets the same way (Windows, macOS, Linux, Android, iOS).
The api_client uses `GameState.web_origin` (default `http://localhost:3000`)
to talk to the backend; override it from a launcher or a build-time constant.

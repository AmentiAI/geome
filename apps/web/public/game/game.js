// geome — web client. Same level JSON schema as packages/shared.
// Replace this folder with a Godot HTML5 export when you're ready.

// ─── Constants ──────────────────────────────────────────────────────────
const GRID = 30;
const GROUND_Y = 540;
const CEILING_Y = 60;          // ship-mode upper boundary
const SPAWN_X = 80;
const SPEED_BASE = 311.58;
const SPEED_TIERS = { 1: 1.0, 2: 1.4, 3: 1.7, 4: 2.0 };
const GRAVITY = 2400;
const JUMP_VELOCITY = -780;
const PAD_VELOCITY = -1100;

const COLORS = {
  primary: "#22d3ee",
  secondary: "#a855f7",
  accent: "#ec4899",
  warn: "#f59e0b",
  danger: "#ef4444",
  good: "#10b981",
  coin: "#facc15",
};

// ─── DOM ────────────────────────────────────────────────────────────────
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const attemptEl = document.getElementById("attempt");
const percentEl = document.getElementById("percent");
const progressEl = document.getElementById("progress");
const toastEl = document.getElementById("toast");
const pauseEl = document.getElementById("pause");
const bestEl = document.getElementById("best");
const att2El = document.getElementById("att2");
const resumeBtn = document.getElementById("resume");
const modeTagEl = document.getElementById("mode-tag");

let DPR = 1, VW = 1280, VH = 720;
function resize() {
  DPR = window.devicePixelRatio || 1;
  VW = window.innerWidth;
  VH = window.innerHeight;
  canvas.width = Math.floor(VW * DPR);
  canvas.height = Math.floor(VH * DPR);
  canvas.style.width = VW + "px";
  canvas.style.height = VH + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener("resize", resize);
resize();

// ─── Tutorial: corridor design (ship-mode dominant) ─────────────────────
const TUTORIAL = {
  id: null,
  schemaVersion: 1,
  name: "Crystal Corridor",
  difficulty: "normal",
  settings: { speed: 1, background: "neon", groundColor: "#1a1a2e", songOffsetMs: 0, bpm: 138, gameMode: "cube" },
  objects: [
    // ─── Cube warmup ───────────────────────────────────────────────
    { type: "spike", x: 480, y: 525 },
    { type: "coin",  x: 600, y: 460 },
    { type: "spike", x: 720, y: 525 },
    { type: "spike", x: 750, y: 525 },
    { type: "block", x: 960, y: 510 },
    { type: "block", x: 990, y: 510 },
    { type: "spike", x: 1080, y: 525 },
    { type: "jump_pad", x: 1230, y: 540 },
    { type: "coin",  x: 1290, y: 340 },
    { type: "spike", x: 1380, y: 525 },

    // ─── Enter ship corridor ───────────────────────────────────────
    { type: "portal_mode",  x: 1530, y: 360, props: { mode: "ship" } },
    { type: "portal_speed", x: 1530, y: 420, props: { tier: 2 } },

    // Corridor walls (ceiling + floor blocks)
    ...corridorRow(1680, 1980, 90),   // ceiling
    ...corridorRow(1680, 1980, 540),  // floor

    // Pinch: spikes top + bottom, coin in the middle
    { type: "spike", x: 2010, y: 525 },
    { type: "spike", x: 2010, y: 95, rotation: 180 },
    { type: "coin",  x: 2100, y: 310 },
    { type: "spike", x: 2190, y: 525 },
    { type: "spike", x: 2190, y: 95, rotation: 180 },

    // Floating mid-platform with spikes underneath
    { type: "block", x: 2340, y: 230 }, { type: "block", x: 2370, y: 230 }, { type: "block", x: 2400, y: 230 },
    { type: "spike", x: 2340, y: 250, rotation: 180 },
    { type: "spike", x: 2400, y: 250, rotation: 180 },

    // Floor mid-platform
    { type: "block", x: 2490, y: 400 }, { type: "block", x: 2520, y: 400 }, { type: "block", x: 2550, y: 400 },
    { type: "spike", x: 2490, y: 380 },
    { type: "spike", x: 2550, y: 380 },

    // Coin column
    { type: "coin", x: 2700, y: 180 },
    { type: "coin", x: 2700, y: 300 },
    { type: "coin", x: 2700, y: 440 },

    // Triple pinch
    { type: "spike", x: 2850, y: 525 },
    { type: "spike", x: 2850, y: 95, rotation: 180 },
    { type: "spike", x: 2880, y: 525 },
    { type: "spike", x: 2880, y: 95, rotation: 180 },

    // Narrowing tunnel — two solid walls of blocks with a thin gap
    ...corridorRow(3000, 3120, 200),
    ...corridorRow(3000, 3120, 420),
    { type: "spike", x: 3030, y: 215 },                     // floor of upper wall
    { type: "spike", x: 3090, y: 405, rotation: 180 },      // ceiling of lower wall

    // Speed punch
    { type: "portal_speed", x: 3270, y: 300, props: { tier: 3 } },

    // Spike rain finale
    { type: "spike", x: 3420, y: 525 },
    { type: "spike", x: 3420, y: 95, rotation: 180 },
    { type: "coin",  x: 3510, y: 250 },
    { type: "spike", x: 3600, y: 525 },
    { type: "spike", x: 3600, y: 95, rotation: 180 },
    { type: "coin",  x: 3690, y: 350 },
    { type: "spike", x: 3780, y: 525 },
    { type: "spike", x: 3780, y: 95, rotation: 180 },

    // Exit corridor
    { type: "portal_mode",  x: 3960, y: 480, props: { mode: "cube" } },
    { type: "portal_speed", x: 3960, y: 540, props: { tier: 2 } },

    // ─── Cube finale ───────────────────────────────────────────────
    { type: "spike", x: 4140, y: 525 },
    { type: "block", x: 4260, y: 510 },
    { type: "spike", x: 4350, y: 525 },
    { type: "jump_pad", x: 4470, y: 540 },
    { type: "coin",  x: 4530, y: 310 },
    { type: "spike", x: 4650, y: 525 },
    { type: "spike", x: 4680, y: 525 },
    { type: "spike", x: 4710, y: 525 },
  ],
};

function corridorRow(xStart, xEnd, y) {
  const out = [];
  for (let x = xStart; x <= xEnd; x += 30) out.push({ type: "block", x, y });
  return out;
}

// ─── Audio (procedural) ─────────────────────────────────────────────────
class Audio {
  constructor() { this.ctx = null; this.master = null; this.musicGain = null; this.muted = false; this.bpm = 130; this.beatHandle = null; }
  ensure() {
    if (this.ctx) return;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.55; this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 0.18; this.musicGain.connect(this.master);
  }
  resume() { this.ensure(); if (this.ctx?.state === "suspended") this.ctx.resume(); }
  setBpm(bpm) { this.bpm = bpm; }
  blip(freq, dur = 0.08, type = "square", gain = 0.35) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.6), t + dur);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }
  jump()   { this.blip(620, 0.07, "square", 0.18); }
  coin()   { this.blip(880, 0.06, "triangle", 0.25); setTimeout(() => this.blip(1320, 0.07, "triangle", 0.25), 50); }
  pad()    { this.blip(380, 0.18, "sawtooth", 0.22); }
  portal() { this.blip(220, 0.08, "sawtooth", 0.18); setTimeout(() => this.blip(740, 0.10, "sine", 0.18), 60); }
  death() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.4);
    g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.5);
  }
  win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.blip(f, 0.18, "triangle", 0.3), i * 90)); }

  startMusic() {
    if (!this.ctx || this.beatHandle) return;
    let step = 0;
    const tick = () => {
      const interval = 60 / this.bpm / 2;
      const now = this.ctx.currentTime;
      if (step % 4 === 0) this._kick(now);
      if (step % 8 === 6) this._snare(now);
      this._hat(now, step % 2 === 0 ? 0.06 : 0.03);
      const bassNotes = [55, 55, 73.42, 65.41, 55, 55, 49, 73.42];
      this._bass(now, bassNotes[step % 8], interval * 1.6);
      step++;
      this.beatHandle = setTimeout(tick, interval * 1000);
    };
    tick();
  }
  stopMusic() { if (this.beatHandle) clearTimeout(this.beatHandle); this.beatHandle = null; }
  _kick(t) { const o = this.ctx.createOscillator(); const g = this.ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.18); g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2); o.connect(g).connect(this.musicGain); o.start(t); o.stop(t + 0.22); }
  _snare(t) { const noise = this.ctx.createBufferSource(); const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.18, this.ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); noise.buffer = buf; const filter = this.ctx.createBiquadFilter(); filter.type = "highpass"; filter.frequency.value = 1500; const g = this.ctx.createGain(); g.gain.value = 0.25; noise.connect(filter).connect(g).connect(this.musicGain); noise.start(t); }
  _hat(t, vol) { const noise = this.ctx.createBufferSource(); const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); noise.buffer = buf; const filter = this.ctx.createBiquadFilter(); filter.type = "highpass"; filter.frequency.value = 7000; const g = this.ctx.createGain(); g.gain.value = vol; noise.connect(filter).connect(g).connect(this.musicGain); noise.start(t); }
  _bass(t, freq, dur) { const o = this.ctx.createOscillator(); const g = this.ctx.createGain(); o.type = "triangle"; o.frequency.value = freq; g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g).connect(this.musicGain); o.start(t); o.stop(t + dur); }
}
const audio = new Audio();

// ─── Particle system ────────────────────────────────────────────────────
const particles = [];
function spawnParticle(p) {
  particles.push({ x: p.x, y: p.y, vx: p.vx ?? 0, vy: p.vy ?? 0, life: p.life ?? 0.5, age: 0, color: p.color ?? "#fff", size: p.size ?? 3, gravity: p.gravity ?? 0, glow: p.glow ?? 0, shape: p.shape ?? "rect" });
}
function burstAt(x, y, color, count = 20, speed = 380, opts = {}) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = speed * (0.4 + Math.random() * 0.8);
    spawnParticle({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.4 + Math.random() * 0.5, color, size: 3 + Math.random() * 4, gravity: opts.gravity ?? 700, glow: opts.glow ?? 14 });
  }
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.age += dt;
    if (p.age >= p.life) { particles.splice(i, 1); continue; }
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}
function drawParticles(camX) {
  for (const p of particles) {
    const t = 1 - p.age / p.life;
    ctx.globalAlpha = t;
    if (p.glow) { ctx.shadowColor = p.color; ctx.shadowBlur = p.glow * t; }
    ctx.fillStyle = p.color;
    const x = p.x - camX, y = p.y, s = p.size * (0.6 + 0.4 * t);
    if (p.shape === "circle") { ctx.beginPath(); ctx.arc(x, y, s / 2, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.fillRect(x - s / 2, y - s / 2, s, s); }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }
}

// ─── Effects (flashes / rings / zoom punches) ───────────────────────────
const effects = [];
function spawnFlash(color, intensity = 0.55, duration = 0.18) { effects.push({ kind: "flash", color, intensity, life: duration, age: 0 }); }
function spawnRing(x, y, color, maxRadius = 220, duration = 0.5, lineWidth = 6) { effects.push({ kind: "ring", x, y, color, maxRadius, life: duration, age: 0, lineWidth }); }
function spawnZoom(strength = 0.08, duration = 0.18) { effects.push({ kind: "zoom", strength, life: duration, age: 0 }); }
function spawnTint(color, intensity = 0.25, duration = 0.6) { effects.push({ kind: "tint", color, intensity, life: duration, age: 0 }); }
function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    effects[i].age += dt;
    if (effects[i].age >= effects[i].life) effects.splice(i, 1);
  }
}
function currentZoom() {
  let z = 1;
  for (const e of effects) {
    if (e.kind !== "zoom") continue;
    const t = 1 - e.age / e.life;
    z += e.strength * t * t;
  }
  return z;
}
function drawWorldRings(camX) {
  for (const e of effects) {
    if (e.kind !== "ring") continue;
    const t = e.age / e.life;
    const r = e.maxRadius * (1 - Math.pow(1 - t, 2));
    const a = 1 - t;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = e.color;
    ctx.lineWidth = e.lineWidth * (1 - t * 0.6);
    ctx.shadowColor = e.color;
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(e.x - camX, e.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
function drawScreenFlashes() {
  for (const e of effects) {
    if (e.kind !== "flash" && e.kind !== "tint") continue;
    const t = 1 - e.age / e.life;
    ctx.save();
    ctx.globalAlpha = e.intensity * t;
    ctx.fillStyle = e.color;
    ctx.fillRect(0, 0, VW, VH);
    ctx.restore();
  }
}

// ─── Stars + bg blobs ───────────────────────────────────────────────────
const stars = [];
const blobs = [];
function buildStars() {
  stars.length = 0;
  for (let i = 0; i < 160; i++) {
    stars.push({ x: Math.random() * 4000, y: Math.random() * VH * 0.95, size: Math.random() * 1.6 + 0.4, depth: 0.15 + Math.random() * 0.6, tw: Math.random() * Math.PI * 2 });
  }
}
function buildBlobs() {
  blobs.length = 0;
  const palette = ["#22d3ee", "#a855f7", "#ec4899", "#3b82f6", "#10b981"];
  for (let i = 0; i < 5; i++) {
    blobs.push({
      x: Math.random() * 1.4 - 0.2,
      y: Math.random() * 1.4 - 0.2,
      vx: (Math.random() - 0.5) * 0.04,
      vy: (Math.random() - 0.5) * 0.04,
      r: 0.35 + Math.random() * 0.35,
      color: palette[i % palette.length],
      phase: Math.random() * Math.PI * 2,
    });
  }
}
buildStars(); buildBlobs();

// ─── State ──────────────────────────────────────────────────────────────
const state = {
  level: null,
  levelLengthPx: 0,
  player: { x: SPAWN_X, y: GROUND_Y, vy: 0, rotation: 0, grounded: true, gravity: GRAVITY, speedTier: 1, dead: false, finished: false, mode: "cube" },
  attempt: 1,
  bestPercent: 0,
  coinsCollected: 0,
  startMs: 0,
  cameraX: 0,
  cameraShake: 0,
  jumpHeld: false,
  jumpBuffer: 0,
  coyote: 0,
  collected: new Set(),
  removedJumpPads: new Set(),
  checkpoint: null,
  practice: false,
  paused: false,
  scoreSubmitted: false,
  trail: [],
  beatPulse: 0,
  hueShift: 0,
};

function speedPxPerSec() { return SPEED_BASE * (SPEED_TIERS[state.player.speedTier] ?? 1); }

// ─── Loading ────────────────────────────────────────────────────────────
function getQuery(name) { return new URLSearchParams(window.location.search).get(name); }
async function loadLevel() {
  const id = getQuery("level");
  if (!id) return TUTORIAL;
  try {
    const r = await fetch(`/api/levels/${id}`);
    if (!r.ok) throw new Error(await r.text());
    const j = await r.json();
    return j.data ? { id, ...j.data } : TUTORIAL;
  } catch (err) { console.warn("level fetch failed, using tutorial:", err); return TUTORIAL; }
}
function computeLength(level) {
  let m = 0;
  for (const o of level.objects) m = Math.max(m, o.x);
  return m + 480;
}

// ─── Init / reset ───────────────────────────────────────────────────────
async function init() {
  state.level = await loadLevel();
  state.levelLengthPx = computeLength(state.level);
  state.player.speedTier = state.level.settings?.speed ?? 1;
  audio.setBpm(state.level.settings?.bpm ?? 130);
  resetAttempt(false);
  requestAnimationFrame(loop);
  setInterval(() => { state.beatPulse = 1; }, 60000 / (state.level.settings?.bpm ?? 130));
}

function resetAttempt(advance = true) {
  if (advance) state.attempt += 1;
  const p = state.player;
  p.x = state.checkpoint?.x ?? SPAWN_X;
  p.y = state.checkpoint?.y ?? GROUND_Y;
  p.vy = 0;
  p.rotation = 0;
  p.grounded = true;
  p.gravity = GRAVITY;
  p.dead = false;
  p.finished = false;
  p.mode = state.level.settings?.gameMode ?? "cube";
  p.speedTier = state.level.settings?.speed ?? 1;
  state.coinsCollected = 0;
  state.collected.clear();
  state.removedJumpPads.clear();
  state.startMs = performance.now();
  state.cameraX = Math.max(0, p.x - 320);
  state.cameraShake = 0;
  state.scoreSubmitted = false;
  state.trail.length = 0;
  state.jumpBuffer = 0;
  state.coyote = 0;
  attemptEl.textContent = `Attempt ${state.attempt}`;
}

// ─── Input ──────────────────────────────────────────────────────────────
function pressJump() { state.jumpHeld = true; state.jumpBuffer = 0.12; audio.resume(); audio.startMusic(); }
function releaseJump() { state.jumpHeld = false; }

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.code === "Space" || e.code === "ArrowUp") { pressJump(); e.preventDefault(); }
  else if (e.code === "KeyR") { state.checkpoint = state.practice ? state.checkpoint : null; resetAttempt(); }
  else if (e.code === "KeyP") togglePractice();
  else if (e.code === "Escape") togglePause();
  else if (e.code === "KeyM") { audio.muted = !audio.muted; flashTag(audio.muted ? "muted" : "unmuted"); }
});
window.addEventListener("keyup", (e) => { if (e.code === "Space" || e.code === "ArrowUp") releaseJump(); });
canvas.addEventListener("pointerdown", pressJump);
canvas.addEventListener("pointerup", releaseJump);
canvas.addEventListener("pointerleave", releaseJump);
resumeBtn.addEventListener("click", togglePause);

function togglePractice() { state.practice = !state.practice; flashTag(state.practice ? "practice mode" : "normal mode"); if (!state.practice) state.checkpoint = null; }
function togglePause() { state.paused = !state.paused; pauseEl.classList.toggle("show", state.paused); bestEl.textContent = state.bestPercent.toFixed(1) + "%"; att2El.textContent = state.attempt; if (state.paused) audio.stopMusic(); else audio.startMusic(); }

let tagTimer = 0;
function flashTag(text) { modeTagEl.textContent = text; modeTagEl.classList.add("show"); clearTimeout(tagTimer); tagTimer = setTimeout(() => modeTagEl.classList.remove("show"), 1100); }

// ─── Geometry ───────────────────────────────────────────────────────────
function rectsOverlap(a, b) { return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1; }
function aabbObj(o) {
  switch (o.type) {
    case "spike": {
      const flipped = Math.abs(o.rotation ?? 0) >= 90;
      return flipped
        ? { x1: o.x - 13, y1: o.y - 14, x2: o.x + 13, y2: o.y + 13 }
        : { x1: o.x - 13, y1: o.y - 13, x2: o.x + 13, y2: o.y + 14 };
    }
    case "coin": return { x1: o.x - 11, y1: o.y - 11, x2: o.x + 11, y2: o.y + 11 };
    case "jump_pad":
    case "jump_orb": return { x1: o.x - 15, y1: o.y, y2: o.y + 12, x2: o.x + 15 };
    case "checkpoint":
    case "portal_gravity": case "portal_speed": case "portal_mode":
      return { x1: o.x - 8, y1: o.y - 30, x2: o.x + 8, y2: o.y + 30 };
    default: return { x1: o.x - 15, y1: o.y - 15, x2: o.x + 15, y2: o.y + 15 };
  }
}
function playerAabb() { const p = state.player; return { x1: p.x - 14, y1: p.y - 14, x2: p.x + 14, y2: p.y + 14 }; }

// ─── Update ─────────────────────────────────────────────────────────────
function update(dt) {
  const p = state.player;
  if (p.dead || p.finished || state.paused) return;

  state.jumpBuffer = Math.max(0, state.jumpBuffer - dt);
  state.coyote = Math.max(0, state.coyote - dt);
  state.cameraShake = Math.max(0, state.cameraShake - dt * 6);
  state.beatPulse = Math.max(0, state.beatPulse - dt * 4);
  state.hueShift = (state.hueShift + dt * 12) % 360;

  // Trail
  state.trail.push({ x: p.x, y: p.y, age: 0 });
  if (state.trail.length > 30) state.trail.shift();
  for (const t of state.trail) t.age += dt;

  p.x += speedPxPerSec() * dt;

  if (p.mode === "cube") updateCube(dt);
  else if (p.mode === "ship") updateShip(dt);
  else if (p.mode === "wave") updateWave(dt);
  else updateCube(dt);

  resolveCollisions(dt);

  const targetCamX = Math.max(0, p.x - VW * 0.32);
  state.cameraX += (targetCamX - state.cameraX) * Math.min(1, dt * 12);

  if (p.x >= state.levelLengthPx) {
    p.finished = true;
    completeLevel();
  }
}

function updateCube(dt) {
  const p = state.player;
  if (p.grounded && (state.jumpBuffer > 0 || state.jumpHeld)) doJump();
  p.vy += p.gravity * dt;
  p.y += p.vy * dt;
  if (p.grounded) p.rotation = Math.round(p.rotation / (Math.PI / 2)) * (Math.PI / 2);
  else p.rotation += dt * Math.PI * 1.7 * Math.sign(p.gravity || 1);
}

function updateShip(dt) {
  const p = state.player;
  const accel = state.jumpHeld ? -2400 : 1900;
  p.vy += accel * Math.sign(p.gravity || 1) * dt;
  p.vy = Math.max(-650, Math.min(650, p.vy));
  p.y += p.vy * dt;
  // Soft clamp to ceiling/floor (ship doesn't die on walls — it just stops)
  if (p.y < CEILING_Y + 14) { p.y = CEILING_Y + 14; if (p.vy < 0) p.vy = 0; }
  if (p.y > GROUND_Y) { p.y = GROUND_Y; if (p.vy > 0) p.vy = 0; }
  p.rotation = Math.max(-0.6, Math.min(0.6, p.vy / 800));
}

function updateWave(dt) {
  const p = state.player;
  const dir = state.jumpHeld ? -1 : 1;
  p.vy = dir * speedPxPerSec() * 0.9 * Math.sign(p.gravity || 1);
  p.y += p.vy * dt;
  if (p.y < CEILING_Y + 14) { p.y = CEILING_Y + 14; }
  if (p.y > GROUND_Y) { p.y = GROUND_Y; }
  p.rotation = dir * 0.6;
}

function doJump() {
  const p = state.player;
  if (!p.grounded) return;
  p.vy = JUMP_VELOCITY * Math.sign(GRAVITY / p.gravity);
  state.jumpBuffer = 0;
  audio.jump();
  for (let i = 0; i < 6; i++) {
    spawnParticle({ x: p.x - 6 + Math.random() * 12, y: p.y + 14, vx: (Math.random() - 0.5) * 220, vy: -Math.random() * 120, life: 0.35, color: "rgba(255,255,255,0.6)", size: 3, gravity: 600 });
  }
}

function resolveCollisions() {
  const p = state.player;
  const pA = playerAabb();
  let landed = false;

  // Cube ground/ceiling clamps
  if (p.mode === "cube") {
    if (p.gravity > 0 && p.y >= GROUND_Y && p.vy >= 0) { p.y = GROUND_Y; p.vy = 0; landed = true; }
    else if (p.gravity < 0 && p.y <= 0 && p.vy <= 0) { p.y = 0; p.vy = 0; landed = true; }
  }

  for (let i = 0; i < state.level.objects.length; i++) {
    if (state.collected.has(i)) continue;
    const o = state.level.objects[i];
    const oA = aabbObj(o);
    if (!rectsOverlap(pA, oA)) continue;

    switch (o.type) {
      case "block": {
        const fromAbove = p.vy >= 0 && pA.y2 - p.vy * 0.016 <= oA.y1 + 6;
        const fromBelow = p.vy <= 0 && pA.y1 - p.vy * 0.016 >= oA.y2 - 6;
        if (p.gravity > 0 && fromAbove) { p.y = oA.y1 - 14; p.vy = 0; landed = true; }
        else if (p.gravity < 0 && fromBelow) { p.y = oA.y2 + 14; p.vy = 0; landed = true; }
        else if (p.mode === "ship" || p.mode === "wave") {
          // Ships/waves clip-stop on blocks rather than dying when squeezed
          if (fromAbove || (p.vy >= 0 && pA.y2 > oA.y1 && pA.y1 < oA.y1)) { p.y = oA.y1 - 14; p.vy = 0; landed = true; }
          else if (fromBelow || (p.vy <= 0 && pA.y1 < oA.y2 && pA.y2 > oA.y2)) { p.y = oA.y2 + 14; p.vy = 0; landed = true; }
          else die();
        }
        else die();
        break;
      }
      case "spike": die(); break;
      case "coin":
        state.collected.add(i);
        state.coinsCollected += 1;
        audio.coin();
        burstAt(o.x, o.y, COLORS.coin, 18, 320, { gravity: 220, glow: 14 });
        spawnRing(o.x, o.y, COLORS.coin, 90, 0.35, 4);
        spawnZoom(0.04, 0.18);
        break;
      case "jump_pad":
      case "jump_orb": {
        if (state.removedJumpPads.has(i)) break;
        p.vy = PAD_VELOCITY * Math.sign(GRAVITY / p.gravity);
        state.removedJumpPads.add(i);
        setTimeout(() => state.removedJumpPads.delete(i), 240);
        audio.pad();
        burstAt(o.x, o.y, COLORS.warn, 14, 320, { gravity: 200, glow: 14 });
        spawnRing(o.x, o.y, COLORS.warn, 140, 0.35, 5);
        spawnZoom(0.05, 0.18);
        break;
      }
      case "checkpoint":
        if (state.practice) { state.checkpoint = { x: p.x - 30, y: p.y }; flashTag("checkpoint set"); spawnRing(o.x, o.y, COLORS.good, 120, 0.4, 4); }
        break;
      case "portal_gravity":
        p.gravity = -p.gravity;
        audio.portal();
        burstAt(o.x, o.y, COLORS.secondary, 28, 360, { gravity: 0, glow: 18 });
        spawnRing(o.x, o.y, COLORS.secondary, 240, 0.55, 6);
        spawnZoom(0.08, 0.22);
        spawnTint(COLORS.secondary, 0.32, 0.35);
        flashTag("gravity flip");
        break;
      case "portal_speed":
        p.speedTier = Number(o.props?.tier ?? 2);
        audio.portal();
        flashTag(`speed ${p.speedTier}×`);
        burstAt(o.x, o.y, COLORS.primary, 24, 360, { gravity: 0, glow: 16 });
        spawnRing(o.x, o.y, COLORS.primary, 220, 0.5, 6);
        spawnZoom(0.07, 0.22);
        spawnTint(COLORS.primary, 0.28, 0.3);
        break;
      case "portal_mode": {
        const newMode = String(o.props?.mode ?? "cube");
        if (p.mode !== newMode) {
          p.mode = newMode;
          flashTag(`${newMode} mode`);
          audio.portal();
          burstAt(o.x, o.y, COLORS.accent, 32, 360, { gravity: 0, glow: 18 });
          spawnRing(o.x, o.y, COLORS.accent, 280, 0.6, 7);
          spawnZoom(0.1, 0.26);
          spawnTint(COLORS.accent, 0.4, 0.4);
        }
        break;
      }
    }
    if (state.player.dead) return;
  }

  p.grounded = landed;
  if (landed) state.coyote = 0.08;
}

function die() {
  const p = state.player;
  if (p.dead) return;
  p.dead = true;
  const pct = currentPercent();
  if (pct > state.bestPercent) state.bestPercent = pct;
  audio.death();
  state.cameraShake = 1.2;
  burstAt(p.x, p.y, COLORS.danger, 50, 600, { gravity: 900, glow: 18 });
  burstAt(p.x, p.y, "#ffffff", 16, 800, { gravity: 600, glow: 24 });
  spawnRing(p.x, p.y, COLORS.danger, 360, 0.55, 8);
  spawnRing(p.x, p.y, "#ffffff", 220, 0.4, 4);
  spawnZoom(0.18, 0.28);
  spawnFlash("#ff2d55", 0.55, 0.18);
  spawnTint(COLORS.danger, 0.35, 0.45);
  submitScore(pct, state.practice);
  setTimeout(() => resetAttempt(), 420);
}

function completeLevel() {
  audio.win();
  burstAt(state.player.x, state.player.y, COLORS.primary, 60, 700, { gravity: 0, glow: 22 });
  burstAt(state.player.x, state.player.y, COLORS.accent, 60, 700, { gravity: 0, glow: 22 });
  burstAt(state.player.x, state.player.y, COLORS.coin, 40, 800, { gravity: 200, glow: 18 });
  spawnRing(state.player.x, state.player.y, COLORS.primary, 480, 0.8, 8);
  spawnRing(state.player.x, state.player.y, COLORS.accent, 380, 0.7, 6);
  spawnRing(state.player.x, state.player.y, COLORS.coin, 280, 0.55, 4);
  spawnZoom(0.2, 0.35);
  spawnFlash("#ffffff", 0.6, 0.25);
  state.cameraShake = 0.7;
  toast("COMPLETE", COLORS.primary);
  submitScore(100, state.practice);
}

function currentPercent() {
  if (state.levelLengthPx <= 0) return 0;
  return Math.max(0, Math.min(100, ((state.player.x - SPAWN_X) / (state.levelLengthPx - SPAWN_X)) * 100));
}

function submitScore(percent, practice) {
  if (state.scoreSubmitted) return;
  state.scoreSubmitted = true;
  if (!state.level.id) return;
  fetch("/api/scores", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ levelId: state.level.id, percent, attempts: 1, durationMs: Math.round(performance.now() - state.startMs), coinsCollected: state.coinsCollected, practice }),
  }).catch(() => {});
}

function toast(text, color) {
  toastEl.textContent = text;
  toastEl.style.color = color;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 900);
}

// ─── Render ─────────────────────────────────────────────────────────────
function shakeOffset() {
  if (state.cameraShake <= 0) return { x: 0, y: 0 };
  const m = state.cameraShake * 16;
  return { x: (Math.random() - 0.5) * m, y: (Math.random() - 0.5) * m };
}

function drawBackground() {
  // Hue-shifting deep gradient
  const h = state.hueShift;
  const grad = ctx.createLinearGradient(0, 0, 0, VH);
  grad.addColorStop(0, `hsl(${(240 + h) % 360}, 60%, 8%)`);
  grad.addColorStop(0.6, `hsl(${(280 + h) % 360}, 70%, 5%)`);
  grad.addColorStop(1, "#04040a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VW, VH);

  // Animated colored blobs that drift + pulse on beat
  const beat = state.beatPulse;
  for (const b of blobs) {
    b.x += b.vx * 0.005;
    b.y += b.vy * 0.005;
    if (b.x < -0.3) b.x = 1.3;
    if (b.x > 1.3) b.x = -0.3;
    if (b.y < -0.3) b.y = 1.3;
    if (b.y > 1.3) b.y = -0.3;
    const cx = b.x * VW;
    const cy = b.y * VH;
    const r = b.r * Math.max(VW, VH) * (0.85 + beat * 0.18);
    const blob = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    blob.addColorStop(0, b.color + "55");
    blob.addColorStop(0.4, b.color + "22");
    blob.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = blob;
    ctx.fillRect(0, 0, VW, VH);
  }

  // Stars (parallax)
  for (const s of stars) {
    const px = ((s.x - state.cameraX * s.depth) % (VW + 200) + (VW + 200)) % (VW + 200) - 100;
    const tw = 0.6 + 0.4 * Math.sin(s.tw + performance.now() * 0.002);
    ctx.globalAlpha = 0.55 * tw;
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(px, s.y, s.size, s.size);
  }
  ctx.globalAlpha = 1;

  // Beat-driven scanline sweep
  const swPos = ((performance.now() * 0.18 + state.cameraX * 0.05) % (VH + 200)) - 100;
  const sw = ctx.createLinearGradient(0, swPos - 60, 0, swPos + 60);
  sw.addColorStop(0, "rgba(34,211,238,0)");
  sw.addColorStop(0.5, "rgba(34,211,238,0.07)");
  sw.addColorStop(1, "rgba(34,211,238,0)");
  ctx.fillStyle = sw;
  ctx.fillRect(0, swPos - 60, VW, 120);

  // Animated grid
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  const step = 60;
  const ox = (state.cameraX * 0.6) % step;
  for (let x = -ox; x < VW; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VH); ctx.stroke(); }
  for (let y = 0; y < VH; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VW, y); ctx.stroke(); }
}

function drawGround() {
  // Floor base
  ctx.fillStyle = "#13131f";
  ctx.fillRect(0, GROUND_Y, VW, VH - GROUND_Y);
  // Pulse line
  const pulse = 1 + state.beatPulse * 0.6;
  const grad = ctx.createLinearGradient(0, GROUND_Y - 4, 0, GROUND_Y + 4);
  grad.addColorStop(0, "rgba(34,211,238,0)");
  grad.addColorStop(0.5, COLORS.primary);
  grad.addColorStop(1, "rgba(168,85,247,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, GROUND_Y - 2 * pulse, VW, 4 * pulse);

  // Hash marks below floor
  ctx.fillStyle = "rgba(34,211,238,0.07)";
  const startX = -((state.cameraX * 1.0) % 60);
  for (let x = startX; x < VW; x += 60) ctx.fillRect(x, GROUND_Y + 18, 30, 2);

  // Ceiling glow line (for ship/wave sections)
  if (state.player.mode === "ship" || state.player.mode === "wave") {
    const cgrad = ctx.createLinearGradient(0, CEILING_Y - 4, 0, CEILING_Y + 4);
    cgrad.addColorStop(0, "rgba(168,85,247,0)");
    cgrad.addColorStop(0.5, COLORS.secondary);
    cgrad.addColorStop(1, "rgba(34,211,238,0)");
    ctx.fillStyle = cgrad;
    ctx.fillRect(0, CEILING_Y - 2 * pulse, VW, 4 * pulse);
  }
}

function drawObject(o, idx) {
  if (state.collected.has(idx)) return;
  const x = o.x - state.cameraX, y = o.y;
  if (x < -80 || x > VW + 80) return;

  switch (o.type) {
    case "block": {
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(x - 15, y - 15, 30, 30);
      ctx.fillStyle = "#475569";
      ctx.fillRect(x - 15, y - 15, 30, 4);
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(x - 15, y + 11, 30, 4);
      // beat-pulsed neon edge
      ctx.strokeStyle = `rgba(34,211,238,${0.25 + state.beatPulse * 0.4})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 14.5, y - 14.5, 29, 29);
      break;
    }
    case "spike": {
      const flipped = Math.abs(o.rotation ?? 0) >= 90;
      ctx.save();
      ctx.translate(x, y);
      if (flipped) ctx.scale(1, -1);
      ctx.shadowColor = COLORS.danger;
      ctx.shadowBlur = 12 + state.beatPulse * 12;
      ctx.fillStyle = COLORS.danger;
      ctx.beginPath();
      ctx.moveTo(-15, 15);
      ctx.lineTo(15, 15);
      ctx.lineTo(0, -15);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.moveTo(-5, 10); ctx.lineTo(5, 10); ctx.lineTo(0, -8);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      break;
    }
    case "coin": {
      const tw = 0.85 + 0.15 * Math.sin(performance.now() * 0.006 + idx);
      ctx.shadowColor = COLORS.coin;
      ctx.shadowBlur = 14 + state.beatPulse * 8;
      ctx.fillStyle = COLORS.coin;
      ctx.beginPath(); ctx.arc(x, y, 10 * tw, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath(); ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case "jump_pad":
    case "jump_orb": {
      ctx.shadowColor = COLORS.warn;
      ctx.shadowBlur = 12 + state.beatPulse * 6;
      ctx.fillStyle = COLORS.warn;
      ctx.fillRect(x - 15, y, 30, 12);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(x - 13, y + 1, 26, 2);
      ctx.shadowBlur = 0;
      break;
    }
    case "portal_gravity":
    case "portal_speed":
    case "portal_mode": {
      const c = o.type === "portal_gravity" ? COLORS.secondary : o.type === "portal_speed" ? COLORS.primary : COLORS.accent;
      ctx.save();
      ctx.shadowColor = c;
      ctx.shadowBlur = 28 + state.beatPulse * 18;
      const wob = Math.sin(performance.now() * 0.008 + idx) * 3;
      const grad = ctx.createLinearGradient(x - 8, y - 30, x + 8, y + 30);
      grad.addColorStop(0, c);
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(1, c);
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.92;
      ctx.fillRect(x - 8 - wob, y - 30, 16 + wob * 2, 60);
      ctx.globalAlpha = 1;
      ctx.restore();
      break;
    }
    case "checkpoint": {
      ctx.shadowColor = COLORS.good;
      ctx.shadowBlur = 14;
      ctx.fillStyle = COLORS.good;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(x - 8, y - 30, 16, 60);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.fillStyle = COLORS.good;
      ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x + 16, y - 22); ctx.lineTo(x, y - 14); ctx.closePath(); ctx.fill();
      break;
    }
  }
}

function drawTrail() {
  const p = state.player;
  for (let i = 0; i < state.trail.length; i++) {
    const t = state.trail[i];
    const a = i / state.trail.length;
    const size = 14 * a;
    ctx.globalAlpha = a * 0.6;
    ctx.fillStyle = p.mode === "ship" ? COLORS.accent : p.mode === "wave" ? COLORS.secondary : COLORS.primary;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8 * a;
    ctx.fillRect(t.x - state.cameraX - size / 2, t.y - size / 2, size, size);
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  const p = state.player;
  const x = p.x - state.cameraX, y = p.y;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(p.rotation);
  ctx.shadowColor = p.mode === "ship" ? COLORS.accent : p.mode === "wave" ? COLORS.secondary : COLORS.primary;
  ctx.shadowBlur = 26 + state.beatPulse * 16;

  if (p.mode === "ship") {
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.moveTo(16, 0); ctx.lineTo(-14, -12); ctx.lineTo(-10, 0); ctx.lineTo(-14, 12);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillRect(-10, -3, 6, 6);
  } else if (p.mode === "wave") {
    ctx.fillStyle = COLORS.secondary;
    ctx.beginPath();
    ctx.moveTo(16, 0); ctx.lineTo(-12, -10); ctx.lineTo(-12, 10);
    ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = COLORS.primary;
    ctx.fillRect(-14, -14, 28, 28);
    ctx.fillStyle = "#0b3a44";
    ctx.fillRect(-7, -7, 14, 14);
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillRect(-13, -13, 6, 6);
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}

function render() {
  const off = shakeOffset();
  const zoom = currentZoom();
  const px = state.player.x - state.cameraX;
  const py = state.player.y;

  // Background draws under the world transform but NOT under the punch zoom
  // (we want the bg to feel reactive but not warp on every coin pickup).
  ctx.save();
  ctx.translate(off.x, off.y);
  drawBackground();
  ctx.restore();

  // World, transformed with shake + zoom-around-player
  ctx.save();
  ctx.translate(off.x + px, off.y + py);
  ctx.scale(zoom, zoom);
  ctx.translate(-px, -py);

  drawGround();
  drawTrail();
  drawParticles(state.cameraX);
  state.level.objects.forEach((o, i) => drawObject(o, i));
  drawWorldRings(state.cameraX);
  drawPlayer();
  ctx.restore();

  // Screen-space tints / flashes
  drawScreenFlashes();

  // HUD
  const pct = currentPercent();
  percentEl.textContent = pct.toFixed(1) + "%";
  progressEl.style.width = pct + "%";
}

// ─── Main loop ──────────────────────────────────────────────────────────
let lastT = performance.now();
function loop(t) {
  let dt = (t - lastT) / 1000;
  lastT = t;
  if (dt > 0.05) dt = 0.05;
  if (!state.paused) {
    update(dt);
    updateParticles(dt);
    updateEffects(dt);
  }
  render();
  requestAnimationFrame(loop);
}

init();

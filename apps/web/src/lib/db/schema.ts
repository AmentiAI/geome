import {
  pgTable,
  text,
  varchar,
  integer,
  bigint,
  boolean,
  timestamp,
  jsonb,
  uuid,
  pgEnum,
  primaryKey,
  index,
  uniqueIndex,
  real,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const difficultyEnum = pgEnum("difficulty", [
  "auto",
  "easy",
  "normal",
  "hard",
  "harder",
  "insane",
  "demon",
]);

export const moderationStatusEnum = pgEnum("moderation_status", [
  "pending",
  "approved",
  "rejected",
  "removed",
]);

export const cosmeticKindEnum = pgEnum("cosmetic_kind", [
  "icon",
  "color_primary",
  "color_secondary",
  "trail",
  "death_effect",
  "ship",
  "ball",
  "ufo",
  "wave",
  "badge",
]);

export const purchaseStatusEnum = pgEnum("purchase_status", [
  "pending",
  "completed",
  "refunded",
  "failed",
]);

export const reportReasonEnum = pgEnum("report_reason", [
  "broken",
  "offensive",
  "stolen",
  "spam",
  "other",
]);

// ──────────── USERS / PROFILES ────────────

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // Clerk user id
    email: text("email").notNull(),
    username: varchar("username", { length: 32 }).notNull(),
    role: varchar("role", { length: 16 }).notNull().default("user"), // user | moderator | admin
    banned: boolean("banned").notNull().default(false),
    bannedReason: text("banned_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    usernameIdx: uniqueIndex("users_username_idx").on(t.username),
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  }),
);

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  iconCosmeticId: uuid("icon_cosmetic_id"),
  primaryColor: varchar("primary_color", { length: 16 }).notNull().default("#22d3ee"),
  secondaryColor: varchar("secondary_color", { length: 16 }).notNull().default("#a855f7"),
  trailCosmeticId: uuid("trail_cosmetic_id"),
  deathCosmeticId: uuid("death_cosmetic_id"),
  totalAttempts: integer("total_attempts").notNull().default(0),
  totalJumps: integer("total_jumps").notNull().default(0),
  starsCollected: integer("stars_collected").notNull().default(0),
  coinsCollected: integer("coins_collected").notNull().default(0),
  demonsBeaten: integer("demons_beaten").notNull().default(0),
  creatorPoints: integer("creator_points").notNull().default(0),
});

// ──────────── SONGS ────────────

export const songs = pgTable(
  "songs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    durationMs: integer("duration_ms").notNull(),
    bpm: integer("bpm"),
    audioUrl: text("audio_url").notNull(),
    licensed: boolean("licensed").notNull().default(false),
    uploadedById: text("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    titleArtistIdx: index("songs_title_artist_idx").on(t.title, t.artist),
  }),
);

// ──────────── LEVELS ────────────

export const levels = pgTable(
  "levels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: text("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    songId: uuid("song_id").references(() => songs.id, { onDelete: "set null" }),
    name: varchar("name", { length: 64 }).notNull(),
    description: text("description"),
    difficulty: difficultyEnum("difficulty").notNull().default("normal"),
    stars: integer("stars").notNull().default(0),
    thumbnailUrl: text("thumbnail_url"),
    published: boolean("published").notNull().default(false),
    featured: boolean("featured").notNull().default(false),
    moderationStatus: moderationStatusEnum("moderation_status").notNull().default("pending"),
    likes: integer("likes").notNull().default(0),
    dislikes: integer("dislikes").notNull().default(0),
    downloads: integer("downloads").notNull().default(0),
    completions: integer("completions").notNull().default(0),
    settings: jsonb("settings").notNull(), // LevelSettings
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => ({
    creatorIdx: index("levels_creator_idx").on(t.creatorId),
    publishedIdx: index("levels_published_idx").on(t.published, t.publishedAt),
    featuredIdx: index("levels_featured_idx").on(t.featured),
    likesIdx: index("levels_likes_idx").on(t.likes),
  }),
);

// Stored as a single JSON blob for fast read (typical GD level: 100KB-2MB).
// Keep here rather than per-row to avoid N writes on edit.
export const levelData = pgTable("level_data", {
  levelId: uuid("level_id")
    .primaryKey()
    .references(() => levels.id, { onDelete: "cascade" }),
  schemaVersion: integer("schema_version").notNull().default(1),
  objects: jsonb("objects").notNull(), // LevelObject[]
  objectCount: integer("object_count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const levelLikes = pgTable(
  "level_likes",
  {
    levelId: uuid("level_id")
      .notNull()
      .references(() => levels.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    value: integer("value").notNull(), // 1 like, -1 dislike
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.levelId, t.userId] }),
    userIdx: index("level_likes_user_idx").on(t.userId),
  }),
);

export const levelComments = pgTable(
  "level_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    levelId: uuid("level_id")
      .notNull()
      .references(() => levels.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    percent: real("percent"), // optional progress %
    pinned: boolean("pinned").notNull().default(false),
    removed: boolean("removed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    levelIdx: index("level_comments_level_idx").on(t.levelId, t.createdAt),
  }),
);

export const levelReports = pgTable(
  "level_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    levelId: uuid("level_id")
      .notNull()
      .references(() => levels.id, { onDelete: "cascade" }),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: reportReasonEnum("reason").notNull(),
    notes: text("notes"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedById: text("resolved_by_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    levelIdx: index("level_reports_level_idx").on(t.levelId),
  }),
);

// ──────────── SCORES / LEADERBOARDS ────────────

export const scores = pgTable(
  "scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    levelId: uuid("level_id")
      .notNull()
      .references(() => levels.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    percent: real("percent").notNull(),
    attempts: integer("attempts").notNull(),
    durationMs: integer("duration_ms").notNull(),
    coinsCollected: integer("coins_collected").notNull().default(0),
    practice: boolean("practice").notNull().default(false),
    achievedAt: timestamp("achieved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    levelUserIdx: uniqueIndex("scores_level_user_best_idx").on(t.levelId, t.userId),
    levelPercentIdx: index("scores_level_percent_idx").on(t.levelId, t.percent),
  }),
);

// ──────────── COSMETICS / SHOP ────────────

export const cosmetics = pgTable(
  "cosmetics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: cosmeticKindEnum("kind").notNull(),
    slug: varchar("slug", { length: 64 }).notNull(),
    displayName: text("display_name").notNull(),
    description: text("description"),
    iconUrl: text("icon_url"),
    rarity: varchar("rarity", { length: 16 }).notNull().default("common"),
    priceCents: integer("price_cents"), // null = not for sale (earned)
    stripePriceId: text("stripe_price_id"),
    seasonId: uuid("season_id"),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("cosmetics_slug_idx").on(t.slug),
    kindIdx: index("cosmetics_kind_idx").on(t.kind),
  }),
);

export const userCosmetics = pgTable(
  "user_cosmetics",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cosmeticId: uuid("cosmetic_id")
      .notNull()
      .references(() => cosmetics.id, { onDelete: "cascade" }),
    acquiredAt: timestamp("acquired_at", { withTimezone: true }).notNull().defaultNow(),
    purchaseId: uuid("purchase_id"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.cosmeticId] }),
  }),
);

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeSessionId: text("stripe_session_id").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    amountCents: integer("amount_cents").notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("usd"),
    status: purchaseStatusEnum("status").notNull().default("pending"),
    items: jsonb("items").notNull(), // [{ cosmeticId, qty, priceCents }]
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => ({
    sessionIdx: uniqueIndex("purchases_session_idx").on(t.stripeSessionId),
    userIdx: index("purchases_user_idx").on(t.userId),
  }),
);

// ──────────── ACHIEVEMENTS ────────────

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  rewardCoins: integer("reward_coins").notNull().default(0),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.achievementId] }),
  }),
);

// ──────────── DAILY / WEEKLY ────────────

export const dailyChallenges = pgTable(
  "daily_challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    levelId: uuid("level_id")
      .notNull()
      .references(() => levels.id, { onDelete: "cascade" }),
    activeOn: timestamp("active_on", { withTimezone: true, mode: "date" }).notNull(),
    rewardCoins: integer("reward_coins").notNull().default(50),
  },
  (t) => ({
    activeOnIdx: uniqueIndex("daily_challenges_active_idx").on(t.activeOn),
  }),
);

export const weeklyChallenges = pgTable(
  "weekly_challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    levelId: uuid("level_id")
      .notNull()
      .references(() => levels.id, { onDelete: "cascade" }),
    weekStart: timestamp("week_start", { withTimezone: true, mode: "date" }).notNull(),
    rewardCoins: integer("reward_coins").notNull().default(250),
  },
  (t) => ({
    weekIdx: uniqueIndex("weekly_challenges_week_idx").on(t.weekStart),
  }),
);

// ──────────── ADMIN AUDIT ────────────

export const adminActions = pgTable(
  "admin_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: text("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 64 }).notNull(),
    targetType: varchar("target_type", { length: 32 }).notNull(),
    targetId: text("target_id").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    adminIdx: index("admin_actions_admin_idx").on(t.adminId, t.createdAt),
    targetIdx: index("admin_actions_target_idx").on(t.targetType, t.targetId),
  }),
);

// ──────────── RELATIONS ────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  levels: many(levels),
  scores: many(scores),
  comments: many(levelComments),
  cosmetics: many(userCosmetics),
  achievements: many(userAchievements),
}));

export const levelsRelations = relations(levels, ({ one, many }) => ({
  creator: one(users, { fields: [levels.creatorId], references: [users.id] }),
  song: one(songs, { fields: [levels.songId], references: [songs.id] }),
  data: one(levelData, { fields: [levels.id], references: [levelData.levelId] }),
  likes: many(levelLikes),
  comments: many(levelComments),
  scores: many(scores),
  reports: many(levelReports),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  level: one(levels, { fields: [scores.levelId], references: [levels.id] }),
  user: one(users, { fields: [scores.userId], references: [users.id] }),
}));

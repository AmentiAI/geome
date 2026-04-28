import { z } from "zod";
import { LevelDataSchema, LevelDifficultySchema } from "./level-schema";

export const PublishLevelRequest = z.object({
  data: LevelDataSchema,
  thumbnailDataUrl: z.string().optional(),
});
export type PublishLevelRequest = z.infer<typeof PublishLevelRequest>;

export const SubmitScoreRequest = z.object({
  levelId: z.string(),
  percent: z.number().min(0).max(100),
  attempts: z.number().int().min(1),
  durationMs: z.number().int().min(0),
  coinsCollected: z.number().int().min(0).max(3).default(0),
  practice: z.boolean().default(false),
});
export type SubmitScoreRequest = z.infer<typeof SubmitScoreRequest>;

export const LevelSummary = z.object({
  id: z.string(),
  name: z.string(),
  creatorUsername: z.string(),
  difficulty: LevelDifficultySchema,
  likes: z.number().int(),
  downloads: z.number().int(),
  thumbnailUrl: z.string().nullable(),
  featured: z.boolean(),
  createdAt: z.string(),
});
export type LevelSummary = z.infer<typeof LevelSummary>;

export const LeaderboardEntry = z.object({
  rank: z.number().int(),
  username: z.string(),
  avatarUrl: z.string().nullable(),
  percent: z.number(),
  attempts: z.number().int(),
  achievedAt: z.string(),
});
export type LeaderboardEntry = z.infer<typeof LeaderboardEntry>;

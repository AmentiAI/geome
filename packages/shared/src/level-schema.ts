import { z } from "zod";

export const ObjectTypeSchema = z.enum([
  "block",
  "spike",
  "portal_gravity",
  "portal_speed",
  "portal_mode",
  "jump_pad",
  "jump_orb",
  "coin",
  "trigger_color",
  "trigger_camera",
  "trigger_speed",
  "background_change",
  "checkpoint",
]);
export type ObjectType = z.infer<typeof ObjectTypeSchema>;

export const LevelObjectSchema = z.object({
  id: z.string().optional(),
  type: ObjectTypeSchema,
  x: z.number(),
  y: z.number(),
  rotation: z.number().default(0),
  scale: z.number().default(1),
  groupId: z.number().int().optional(),
  props: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});
export type LevelObject = z.infer<typeof LevelObjectSchema>;

export const LevelSettingsSchema = z.object({
  speed: z.number().min(0.5).max(4).default(1),
  background: z.string().default("dark-city"),
  groundColor: z.string().default("#1a1a2e"),
  songOffsetMs: z.number().default(0),
  bpm: z.number().default(120),
  gameMode: z.enum(["cube", "ship", "ball", "ufo", "wave"]).default("cube"),
});
export type LevelSettings = z.infer<typeof LevelSettingsSchema>;

export const LevelDifficultySchema = z.enum([
  "auto",
  "easy",
  "normal",
  "hard",
  "harder",
  "insane",
  "demon",
]);
export type LevelDifficulty = z.infer<typeof LevelDifficultySchema>;

export const LevelDataSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  name: z.string().min(1).max(64),
  description: z.string().max(500).optional(),
  creatorId: z.string(),
  songId: z.string().optional(),
  difficulty: LevelDifficultySchema.default("normal"),
  settings: LevelSettingsSchema,
  objects: z.array(LevelObjectSchema),
});
export type LevelData = z.infer<typeof LevelDataSchema>;

export const EMPTY_LEVEL: LevelData = {
  schemaVersion: 1,
  name: "Untitled",
  creatorId: "",
  difficulty: "normal",
  settings: {
    speed: 1,
    background: "dark-city",
    groundColor: "#1a1a2e",
    songOffsetMs: 0,
    bpm: 120,
    gameMode: "cube",
  },
  objects: [],
};

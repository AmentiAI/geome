import Ably from "ably";
import { env } from "./env";

let _rest: Ably.Rest | null = null;

export function ablyRest(): Ably.Rest {
  if (_rest) return _rest;
  const key = env.ABLY_API_KEY();
  if (!key) throw new Error("ABLY_API_KEY is not set");
  _rest = new Ably.Rest({ key });
  return _rest;
}

export function ablyConfigured(): boolean {
  return !!env.ABLY_API_KEY();
}

export const realtimeChannels = {
  level: (levelId: string) => `level:${levelId}`,
  leaderboard: (levelId: string) => `leaderboard:${levelId}`,
  daily: () => `daily-challenge`,
};

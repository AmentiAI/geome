import type { Config } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL ?? "";

if (!databaseUrl) {
  console.warn("[drizzle.config] DATABASE_URL is not set; migration commands will fail.");
}

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
} satisfies Config;

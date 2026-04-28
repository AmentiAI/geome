function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  DATABASE_URL: () => required("DATABASE_URL"),
  CLERK_SECRET_KEY: () => optional("CLERK_SECRET_KEY"),
  CLERK_WEBHOOK_SECRET: () => optional("CLERK_WEBHOOK_SECRET"),
  R2_ACCOUNT_ID: () => optional("R2_ACCOUNT_ID"),
  R2_ACCESS_KEY_ID: () => optional("R2_ACCESS_KEY_ID"),
  R2_SECRET_ACCESS_KEY: () => optional("R2_SECRET_ACCESS_KEY"),
  R2_BUCKET: () => optional("R2_BUCKET") ?? "geome-assets",
  R2_PUBLIC_BASE_URL: () => optional("R2_PUBLIC_BASE_URL"),
  STRIPE_SECRET_KEY: () => optional("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: () => optional("STRIPE_WEBHOOK_SECRET"),
  ABLY_API_KEY: () => optional("ABLY_API_KEY"),
};

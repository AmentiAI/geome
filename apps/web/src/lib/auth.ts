import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "./db/client";
import { users, profiles } from "./db/schema";

export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Response("Unauthorized", { status: 401 });
  return userId;
}

/**
 * Loads the local user row for the currently signed-in Clerk user.
 * Lazily creates the row on first access so we don't require the Clerk webhook
 * to be wired before development can proceed.
 */
export async function getOrCreateLocalUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const existing = await db.query.users.findFirst({ where: eq(users.id, clerkUser.id) });
  if (existing) return existing;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkUser.id}@unknown.local`;
  const username = (clerkUser.username ?? `player_${clerkUser.id.slice(-6)}`).toLowerCase();

  const [created] = await db
    .insert(users)
    .values({ id: clerkUser.id, email, username })
    .onConflictDoNothing()
    .returning();

  if (created) {
    await db.insert(profiles).values({ userId: created.id }).onConflictDoNothing();
  }

  return created ?? (await db.query.users.findFirst({ where: eq(users.id, clerkUser.id) })) ?? null;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const u = await db.query.users.findFirst({ where: eq(users.id, userId) });
  return u?.role === "admin";
}

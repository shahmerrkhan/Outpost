"use server";

import { db } from "@/../db";
import { users, teamMembers } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function getMyTeamStatus() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { hasTeam: false, onboarded: false };
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser.id));
  if (!dbUser) return { hasTeam: false, onboarded: false };
  const [membership] = await db.select().from(teamMembers).where(eq(teamMembers.userId, dbUser.id));
  return { hasTeam: !!membership, onboarded: dbUser.onboarded };
}
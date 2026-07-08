"use server";

import { db } from "@/../db";
import { users, teams, teamMembers } from "@/../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureDbUser } from "@/app/actions/user";

export async function saveProfileInfo(school: string) {
  const dbUser = await ensureDbUser();
  await db.update(users).set({ school }).where(eq(users.id, dbUser.id));
}

export async function completeAsFounder(teamName: string, description: string) {
  const dbUser = await ensureDbUser();
  const [team] = await db
    .insert(teams)
    .values({ orgId: dbUser.orgId!, leaderId: dbUser.id, name: teamName, description })
    .returning();

  await db.insert(teamMembers).values({ teamId: team.id, userId: dbUser.id, status: "active" });
  await db.update(users).set({ role: "leader", onboarded: true }).where(eq(users.id, dbUser.id));

  revalidatePath("/dashboard");
  return team;
}

export async function completeAsMember() {
  const dbUser = await ensureDbUser();
  await db.update(users).set({ onboarded: true }).where(eq(users.id, dbUser.id));
  revalidatePath("/dashboard");
}

export async function getAllTeamsForOnboarding() {
  await ensureDbUser();
  return db.select().from(teams);
}
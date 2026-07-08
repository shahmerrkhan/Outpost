"use server";

import { db } from "@/../db";
import { registrants, users, teamMembers } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not signed in");
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser.id));
  if (!dbUser) throw new Error("User not synced");
  return dbUser;
}

async function assertTeamMember(teamId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
  if (!membership) throw new Error("Not authorized");
}

export async function getRegistrants(teamId: string) {
  return db.select().from(registrants).where(eq(registrants.teamId, teamId));
}

export async function addRegistrant(
  teamId: string,
  name: string,
  email: string,
  school: string,
  grade: string
) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  await db.insert(registrants).values({ teamId, name, email, school, grade });
  revalidatePath("/dashboard/registrants");
}

export type RegistrantStatus = "registered" | "confirmed" | "attended" | "no_show" | "cancelled";

export async function updateRegistrantStatus(registrantId: string, status: RegistrantStatus) {
  await db.update(registrants).set({ status }).where(eq(registrants.id, registrantId));
  revalidatePath("/dashboard/registrants");
}

export async function updateRegistrantNotes(registrantId: string, notes: string) {
  await db.update(registrants).set({ notes }).where(eq(registrants.id, registrantId));
  revalidatePath("/dashboard/registrants");
}

export async function deleteRegistrant(registrantId: string) {
  await db.delete(registrants).where(eq(registrants.id, registrantId));
  revalidatePath("/dashboard/registrants");
}
"use server";

import { db } from "@/../db";
import { registrants, users, teamMembers } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addRegistrantSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().min(1).max(200).email(),
  school: z.string().trim().max(200).optional().or(z.literal("")),
  grade: z.string().trim().max(50).optional().or(z.literal("")),
});

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

async function assertRegistrantInTeam(registrantId: string, teamId: string) {
  const [r] = await db
    .select()
    .from(registrants)
    .where(and(eq(registrants.id, registrantId), eq(registrants.teamId, teamId)));
  if (!r) throw new Error("Registrant not found in this team");
  return r;
}

export async function getRegistrants(teamId: string) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
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

  const parsed = addRegistrantSchema.parse({ name, email, school, grade });

  await db.insert(registrants).values({ teamId, ...parsed });
  revalidatePath("/dashboard/registrants");
}

export type RegistrantStatus = "registered" | "confirmed" | "attended" | "no_show" | "cancelled";
const VALID_REGISTRANT_STATUSES: RegistrantStatus[] = ["registered", "confirmed", "attended", "no_show", "cancelled"];

export async function updateRegistrantStatus(teamId: string, registrantId: string, status: RegistrantStatus) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  await assertRegistrantInTeam(registrantId, teamId);
  if (!VALID_REGISTRANT_STATUSES.includes(status)) throw new Error("Invalid status");

  await db.update(registrants).set({ status }).where(eq(registrants.id, registrantId));
  revalidatePath("/dashboard/registrants");
}

export async function updateRegistrantNotes(teamId: string, registrantId: string, notes: string) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  await assertRegistrantInTeam(registrantId, teamId);
  if (notes.length > 5000) throw new Error("Notes too long");

  await db.update(registrants).set({ notes }).where(eq(registrants.id, registrantId));
  revalidatePath("/dashboard/registrants");
}

export async function deleteRegistrant(teamId: string, registrantId: string) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  await assertRegistrantInTeam(registrantId, teamId);

  await db.delete(registrants).where(eq(registrants.id, registrantId));
  revalidatePath("/dashboard/registrants");
}
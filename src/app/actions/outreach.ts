"use server";

import { db } from "@/../db";
import { outreachLogs, contacts, teamMembers, users } from "@/../db/schema";
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

export async function updateContactStatus(contactId: string, status: string) {
  await db.update(contacts).set({ status }).where(eq(contacts.id, contactId));
  revalidatePath("/crm");
}

export async function addContact(teamId: string, name: string, email: string, company: string) {
  const existing = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.teamId, teamId), eq(contacts.name, name), eq(contacts.company, company)));

  if (existing.length > 0) {
    throw new Error("This contact already exists for this team.");
  }

  const [contact] = await db
    .insert(contacts)
    .values({ teamId, name, email, company })
    .returning();
  revalidatePath("/crm");
  return contact;
}

export async function logOutreach(teamId: string, contactId: string, type: "email" | "call" | "meeting", notes: string) {
  const dbUser = await getDbUser();
  await db.insert(outreachLogs).values({
    userId: dbUser.id,
    teamId,
    contactId,
    type,
    notes,
  });
  revalidatePath("/crm");
  revalidatePath("/leaderboard");
}

export async function logActivity(data: {
  teamId: string;
  type: string;
  company?: string;
  contactEmail?: string;
  notes?: string;
  outcome?: string;
  timeSpentMin?: string;
}) {
  const dbUser = await getDbUser();
  await db.insert(outreachLogs).values({
    userId: dbUser.id,
    teamId: data.teamId,
    type: data.type as any,
    company: data.company,
    contactEmail: data.contactEmail,
    notes: data.notes,
    outcome: data.outcome,
    timeSpentMin: data.timeSpentMin,
  });
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath("/live-feed");
}
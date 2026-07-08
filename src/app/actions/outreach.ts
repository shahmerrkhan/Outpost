"use server";

import { db } from "@/../db";
import { outreachLogs, contacts, teamMembers, users } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkRateLimit, standardRateLimit } from "@/app/lib/ratelimit";
import { z } from "zod";

const addContactSchema = z.object({
  name: z.string().trim().min(1).max(200).regex(/^[a-zA-Z\s.'-]+$/, "Name cannot contain numbers or symbols"),
  email: z.string().trim().max(200).email("Must be a valid email").optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
});

const logActivitySchema = z.object({
  teamId: z.string().uuid(),
  type: z.enum([
    "email", "follow_up", "call", "meeting", "sponsor_outreach",
    "partnership_outreach", "social_media", "design_work", "dev_work", "general_task",
  ]),
  company: z.string().trim().max(200).optional(),
  contactEmail: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(5000).optional(),
  outcome: z.string().trim().max(500).optional(),
  timeSpentMin: z.string().trim().max(10).optional(),
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

async function assertContactInTeam(contactId: string, teamId: string) {
  const [contact] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.teamId, teamId)));
  if (!contact) throw new Error("Contact not found in this team");
  return contact;
}

export async function updateContactStatus(teamId: string, contactId: string, status: string) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  await assertContactInTeam(contactId, teamId);

  const validStatuses = ["lead", "contacted", "responded", "meeting_scheduled", "negotiating", "confirmed", "lost"];
  if (!validStatuses.includes(status)) throw new Error("Invalid status");

  await db.update(contacts).set({ status }).where(eq(contacts.id, contactId));
  revalidatePath("/crm");
}

export async function addContact(teamId: string, name: string, email: string, company: string) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  await checkRateLimit(standardRateLimit, dbUser.id);

  const parsed = addContactSchema.parse({ name, email, company });
  name = parsed.name;
  email = parsed.email ?? "";
  company = parsed.company ?? "";

  const existing = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.teamId, teamId), eq(contacts.name, name)));

  if (existing.length > 0) {
    throw new Error("A contact with this name already exists for this team.");
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
  await assertTeamMember(teamId, dbUser.id);
  await assertContactInTeam(contactId, teamId);

  if (notes && notes.length > 5000) throw new Error("Notes too long");

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

const VALID_OUTREACH_TYPES = [
  "email", "follow_up", "call", "meeting", "sponsor_outreach",
  "partnership_outreach", "social_media", "design_work", "dev_work", "general_task",
];

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
  await assertTeamMember(data.teamId, dbUser.id);
  await checkRateLimit(standardRateLimit, dbUser.id);

  data = logActivitySchema.parse(data);

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
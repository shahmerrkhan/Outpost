"use server";

import { db } from "@/../db";
import { announcements, sharedCredentials, users, teamMembers, teams } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendMail } from "@/app/lib/mail";
import { encrypt, decrypt } from "@/app/lib/crypto";
import { checkRateLimit, strictRateLimit } from "@/app/lib/ratelimit";
import { z } from "zod";

const announcementSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

const credentialSchema = z.object({
  label: z.string().trim().min(1).max(100),
  site: z.string().trim().min(1).max(200),
  username: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(500),
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

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function postAnnouncement(teamId: string, content: string, pinned: boolean) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  await checkRateLimit(strictRateLimit, dbUser.id);

  const parsed = announcementSchema.parse({ content });
  content = parsed.content;

  const [newAnnouncement] = await db.insert(announcements).values({ teamId, authorId: dbUser.id, content, pinned }).returning();

  const members = await db
    .select({ email: users.email })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));

  for (const m of members) {
    await sendMail(m.email, `New announcement in ${team.name}`, `<p>${escapeHtml(content)}</p>`);
  }

  revalidatePath("/dashboard");
  return newAnnouncement;
}

export async function togglePin(announcementId: string, teamId: string, pinned: boolean) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  await db
    .update(announcements)
    .set({ pinned })
    .where(and(eq(announcements.id, announcementId), eq(announcements.teamId, teamId)));
  revalidatePath("/dashboard");
}

export async function getTeamAnnouncements(teamId: string) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  return db.select().from(announcements).where(eq(announcements.teamId, teamId));
}

export async function addCredential(teamId: string, label: string, site: string, username: string, password: string) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);

  const parsed = credentialSchema.parse({ label, site, username, password });
  const encrypted = encrypt(parsed.password);
  await db.insert(sharedCredentials).values({ teamId, label: parsed.label, site: parsed.site, username: parsed.username, password: encrypted });
  revalidatePath("/dashboard");
}

export async function getTeamCredentials(teamId: string) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  const rows = await db.select().from(sharedCredentials).where(eq(sharedCredentials.teamId, teamId));
  return rows.map((r) => ({ ...r, password: decrypt(r.password) }));
}
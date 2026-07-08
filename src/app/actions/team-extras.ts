"use server";

import { db } from "@/../db";
import { announcements, sharedCredentials, users, teamMembers, teams } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendMail } from "@/app/lib/mail";

async function getDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not signed in");
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser.id));
  if (!dbUser) throw new Error("User not synced");
  return dbUser;
}

export async function postAnnouncement(teamId: string, content: string, pinned: boolean) {
  const dbUser = await getDbUser();
  await db.insert(announcements).values({ teamId, authorId: dbUser.id, content, pinned });

  const members = await db
    .select({ email: users.email })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));

  for (const m of members) {
    await sendMail(m.email, `New announcement in ${team.name}`, `<p>${content}</p>`);
  }

  revalidatePath("/dashboard");
}

export async function togglePin(announcementId: string, pinned: boolean) {
  await db.update(announcements).set({ pinned }).where(eq(announcements.id, announcementId));
  revalidatePath("/dashboard");
}

export async function getTeamAnnouncements(teamId: string) {
  return db.select().from(announcements).where(eq(announcements.teamId, teamId));
}

export async function addCredential(teamId: string, label: string, site: string, username: string, password: string) {
  await db.insert(sharedCredentials).values({ teamId, label, site, username, password });
  revalidatePath("/dashboard");
}

export async function getTeamCredentials(teamId: string) {
  return db.select().from(sharedCredentials).where(eq(sharedCredentials.teamId, teamId));
}
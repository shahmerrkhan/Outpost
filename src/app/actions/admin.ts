"use server";

import { db } from "@/../db";
import { users, teamMembers, teams, outreachLogs } from "@/../db/schema";
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

async function assertFounder(teamId: string, userId: string) {
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team || team.leaderId !== userId) throw new Error("Not authorized");
  return team;
}

export async function getTeamMembers(teamId: string) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));
}

export async function removeMember(teamId: string, memberUserId: string) {
  const dbUser = await getDbUser();
  await assertFounder(teamId, dbUser.id);
  await db
    .delete(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, memberUserId)));
  revalidatePath("/dashboard/admin");
}

export async function updateMemberRole(teamId: string, memberUserId: string, role: string) {
  const dbUser = await getDbUser();
  await assertFounder(teamId, dbUser.id);
  await db
    .update(teamMembers)
    .set({ role })
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, memberUserId)));
  revalidatePath("/dashboard/admin");
}

export async function getTeamOversight(teamId: string) {
  const members = await getTeamMembers(teamId);
  const logs = await db.select().from(outreachLogs).where(eq(outreachLogs.teamId, teamId));

  const perMember = members.map((m) => {
    const memberLogs = logs.filter((l) => l.userId === m.id);
    return {
      ...m,
      totalLogs: memberLogs.length,
      lastActive: memberLogs.length
        ? memberLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
        : null,
    };
  });

  return perMember;
}
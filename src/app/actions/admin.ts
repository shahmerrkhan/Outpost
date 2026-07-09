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
  if (!team) throw new Error("Team not found");
  if (team.leaderId === userId) return team;

  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

  if (membership?.role === "lead") return team;

  throw new Error("Not authorized");
}

export async function getTeamMembers(teamId: string) {
  const dbUser = await getDbUser();
  await assertFounder(teamId, dbUser.id);

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
  const team = await assertFounder(teamId, dbUser.id);
  if (memberUserId === team.leaderId) throw new Error("Cannot remove the team founder");
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
  const dbUser = await getDbUser();
  const team = await assertFounder(teamId, dbUser.id);

  const members = (await getTeamMembers(teamId)).filter((m) => m.id !== team.leaderId);
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

export async function getMemberDetail(teamId: string, memberUserId: string) {
  const dbUser = await getDbUser();
  await assertFounder(teamId, dbUser.id);

  const [member] = await db
    .select({ id: users.id, name: users.name, email: users.email, school: users.school })
    .from(users)
    .where(eq(users.id, memberUserId));

  if (!member) throw new Error("Member not found");

  const logs = await db
    .select()
    .from(outreachLogs)
    .where(and(eq(outreachLogs.teamId, teamId), eq(outreachLogs.userId, memberUserId)));

  const byType: Record<string, number> = {};
  for (const l of logs) {
    byType[l.type] = (byType[l.type] ?? 0) + 1;
  }

  const byDay: Record<string, number> = {};
  for (const l of logs) {
    const day = l.createdAt.toISOString().slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }

  const recentLogs = [...logs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 20);

  return { member, logs, byType, byDay, recentLogs, totalLogs: logs.length };
}

export async function renameTeam(teamId: string, newName: string) {
  const dbUser = await getDbUser();
  await assertFounder(teamId, dbUser.id);

  const trimmed = newName.trim();
  if (!trimmed || trimmed.length > 100) throw new Error("Invalid team name");

  await db.update(teams).set({ name: trimmed }).where(eq(teams.id, teamId));
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");
  revalidatePath("/teams");
}
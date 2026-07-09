"use server";

import { cookies } from "next/headers";
import { db } from "@/../db";
import { teams, teamMembers } from "@/../db/schema";
import { eq, and } from "drizzle-orm";
import { ensureDbUser } from "@/app/actions/user";

export async function getUserTeamContext() {
  const dbUser = await ensureDbUser();

  const founderTeams = await db.select().from(teams).where(eq(teams.leaderId, dbUser.id));

  const memberships = await db
    .select({ team: teams })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, dbUser.id));

  const founderTeamIds = new Set(founderTeams.map((t) => t.id));
  const memberTeams = memberships.map((m) => m.team).filter((t) => !founderTeamIds.has(t.id));

  return {
    founderTeams,
    memberTeams,
    isFounder: founderTeams.length > 0,
    isMember: memberTeams.length > 0,
  };
}

export async function setActiveContext(teamId: string, mode: "founder" | "member") {
  const dbUser = await ensureDbUser();

  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, dbUser.id)));
  if (!membership) throw new Error("Not a member of this team");

  if (mode === "founder") {
    const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
    if (!team || team.leaderId !== dbUser.id) throw new Error("Not the founder of this team");
  }

  const cookieStore = await cookies();
  cookieStore.set("activeTeamId", teamId, { path: "/" });
  cookieStore.set("activeMode", mode, { path: "/" });
}

export async function getActiveContext() {
  const cookieStore = await cookies();
  const teamId = cookieStore.get("activeTeamId")?.value ?? null;
  const mode = (cookieStore.get("activeMode")?.value as "founder" | "member") ?? null;
  return { teamId, mode };
}

export async function getMyRoleInActiveTeam() {
  const dbUser = await ensureDbUser();
  const cookieStore = await cookies();
  const teamId = cookieStore.get("activeTeamId")?.value;
  if (!teamId) return null;

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (team?.leaderId === dbUser.id) return "founder";

  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, dbUser.id)));

  return membership?.role ?? null;
}
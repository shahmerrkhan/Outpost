"use server";

import { cookies } from "next/headers";
import { db } from "@/../db";
import { teams, teamMembers } from "@/../db/schema";
import { eq } from "drizzle-orm";
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
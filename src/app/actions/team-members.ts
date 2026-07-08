"use server";

import { db } from "@/../db";
import { teamMembers, users, teams } from "@/../db/schema";
import { eq } from "drizzle-orm";
import { ensureDbUser } from "@/app/actions/user";

export async function getTeamMembersList(teamId: string) {
  await ensureDbUser();

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team) throw new Error("Team not found");

  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      school: users.school,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));

  return { team, members };
}
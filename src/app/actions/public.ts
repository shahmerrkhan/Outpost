"use server";

import { db } from "@/../db";
import { teams, teamMembers } from "@/../db/schema";
import { sql } from "drizzle-orm";

export async function getPublicTeams() {
  const allTeams = await db.select().from(teams);
  const counts = await db
    .select({ teamId: teamMembers.teamId, count: sql<number>`count(*)`.as("count") })
    .from(teamMembers)
    .groupBy(teamMembers.teamId);
  const countMap = new Map(counts.map((c) => [c.teamId, Number(c.count)]));
  return allTeams.map((t) => ({ ...t, memberCount: countMap.get(t.id) ?? 0 }));
}
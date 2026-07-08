"use server";

import { db } from "@/../db";
import { teams, teamMembers, joinRequests, notifications, users } from "@/../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendMail } from "@/app/lib/mail";
import { checkRateLimit, standardRateLimit } from "@/app/lib/ratelimit";

import { ensureDbUser } from "@/app/actions/user";

export async function createTeam(name: string, description: string) {
  const dbUser = await ensureDbUser();
  await checkRateLimit(standardRateLimit, dbUser.id);

  if (!name || name.trim().length === 0 || name.length > 200) throw new Error("Invalid team name");
  if (description && description.length > 2000) throw new Error("Description too long");

  const [team] = await db
    .insert(teams)
    .values({ orgId: dbUser.orgId!, leaderId: dbUser.id, name, description })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: dbUser.id,
    status: "active",
  });

  await db.update(users).set({ role: "leader" }).where(eq(users.id, dbUser.id));

  revalidatePath("/teams");
  return team;
}

export async function requestToJoin(teamId: string) {
  const dbUser = await ensureDbUser();
  await checkRateLimit(standardRateLimit, dbUser.id);

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team) throw new Error("Team not found");

  const [existingMembership] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, dbUser.id)));
  if (existingMembership) throw new Error("Already a member of this team");

  const [existingRequest] = await db
    .select()
    .from(joinRequests)
    .where(and(eq(joinRequests.teamId, teamId), eq(joinRequests.userId, dbUser.id), eq(joinRequests.status, "pending")));
  if (existingRequest) throw new Error("Join request already pending");

  const [leader] = await db.select().from(users).where(eq(users.id, team.leaderId));

  await db.insert(joinRequests).values({
    teamId,
    userId: dbUser.id,
    status: "pending",
  });

  await db.insert(notifications).values({
    userId: team.leaderId,
    type: "join_request",
    payload: JSON.stringify({ teamId, requesterId: dbUser.id, requesterName: dbUser.name }),
  });

  await sendMail(
    leader.email,
    `${dbUser.name} wants to join ${team.name}`,
    `<p><strong>${dbUser.name}</strong> requested to join your team <strong>${team.name}</strong> on Outpost.</p><p>Log in to approve or deny: <a href="${process.env.NEXT_PUBLIC_APP_URL}/notifications">Review Request</a></p>`
  );

  revalidatePath("/teams");
}
export async function getNotificationsData() {
  const dbUser = await ensureDbUser();

  const myNotifs = await db.select().from(notifications).where(eq(notifications.userId, dbUser.id));

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, dbUser.id), isNull(notifications.readAt)));

  const myTeams = await db.select().from(teams).where(eq(teams.leaderId, dbUser.id));
  const myTeamIds = myTeams.map((t) => t.id);

  const pendingRequests = myTeamIds.length
    ? await db.select().from(joinRequests).where(eq(joinRequests.status, "pending"))
    : [];

  const relevantRequests = pendingRequests.filter((r) => myTeamIds.includes(r.teamId));

  const allUsers = await db.select().from(users);
  const nameMap = new Map(allUsers.map((u) => [u.id, u.name]));

  const enrichedRequests = relevantRequests.map((r) => ({
    ...r,
    requesterName: nameMap.get(r.userId) ?? "Someone",
  }));

  return {
    notifs: myNotifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    pendingRequests: enrichedRequests,
  };
}

export async function getMyFounderTeams() {
  const dbUser = await ensureDbUser();
  return db.select().from(teams).where(eq(teams.leaderId, dbUser.id));
}

export async function getMyTeamId() {
  const dbUser = await ensureDbUser();
  const [membership] = await db.select().from(teamMembers).where(eq(teamMembers.userId, dbUser.id));
  return membership?.teamId ?? null;
}

export async function getUnreadCount() {
  const dbUser = await ensureDbUser();
  const unread = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, dbUser.id), isNull(notifications.readAt)));
  return unread.length;
}

export async function respondToRequest(requestId: string, approve: boolean) {
  const dbUser = await ensureDbUser();
  const [request] = await db.select().from(joinRequests).where(eq(joinRequests.id, requestId));
  if (!request) throw new Error("Request not found");
  if (request.status !== "pending") throw new Error("Request already handled");

  const [requester] = await db.select().from(users).where(eq(users.id, request.userId));
  const [team] = await db.select().from(teams).where(eq(teams.id, request.teamId));
  if (!team || team.leaderId !== dbUser.id) throw new Error("Not authorized");

  await db
    .update(joinRequests)
    .set({ status: approve ? "approved" : "denied" })
    .where(eq(joinRequests.id, requestId));

  if (approve) {
    await db.insert(teamMembers).values({
      teamId: request.teamId,
      userId: request.userId,
      status: "active",
    });
  }

  await db.insert(notifications).values({
    userId: request.userId,
    type: approve ? "approved" : "denied",
    payload: JSON.stringify({ teamId: request.teamId, teamName: team.name }),
  });

  await sendMail(
    requester.email,
    approve ? `You're in! Welcome to ${team.name}` : `Update on your request to join ${team.name}`,
    approve
      ? `<p>Your request to join <strong>${team.name}</strong> was approved. Log in to get started: <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard</a></p>`
      : `<p>Your request to join <strong>${team.name}</strong> was not approved this time.</p>`
  );

  revalidatePath("/dashboard");
}

export async function getOnboardedStatus() {
  const dbUser = await ensureDbUser();
  return dbUser.onboarded;
}
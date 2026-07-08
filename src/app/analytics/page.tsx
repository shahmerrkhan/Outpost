import { db } from "@/../db";
import { outreachLogs, users, teamMembers, contacts } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getActiveContext } from "@/app/actions/session-context";
import PageWrap from "@/app/components/PageWrap";
import AnalyticsCharts from "@/app/components/AnalyticsCharts";
import { BarChart3 } from "lucide-react";
import { teams } from "@/../db/schema";

export default async function AnalyticsPage() {
  const clerkUser = await currentUser();
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser!.id));
  if (!dbUser.onboarded) redirect("/onboarding");

  const active = await getActiveContext();
  const myMemberships = await db.select().from(teamMembers).where(eq(teamMembers.userId, dbUser.id));
  const myTeamId = active.teamId ?? myMemberships[0]?.teamId;

  if (!myTeamId) {
    return (
      <PageWrap>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-12 text-center">
          <p className="text-gray-400">Join a team first to see analytics.</p>
        </div>
      </div>
      </PageWrap>
    );
  }

  const [team] = await db.select().from(teams).where(eq(teams.id, myTeamId));
  const isLeader = team?.leaderId === dbUser.id;

  const allLogsForTeam = await db.select().from(outreachLogs).where(eq(outreachLogs.teamId, myTeamId));
  const logs = isLeader ? allLogsForTeam : allLogsForTeam.filter((l) => l.userId === dbUser.id);

  const teamContacts = await db.select().from(contacts).where(eq(contacts.teamId, myTeamId));
  const allUsers = await db.select().from(users);
  const userMap = new Map(allUsers.map((u) => [u.id, u.name]));

  // activity over time (last 14 days)
  const dayCount: Record<string, number> = {};
  for (const log of logs) {
    const day = log.createdAt.toISOString().slice(0, 10);
    dayCount[day] = (dayCount[day] ?? 0) + 1;
  }
  const timeSeries = Object.entries(dayCount)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, count]) => ({ date: date.slice(5), count }));

  // activity breakdown by type
  const typeCount: Record<string, number> = {};
  for (const log of logs) {
    typeCount[log.type] = (typeCount[log.type] ?? 0) + 1;
  }
  const breakdown = Object.entries(typeCount).map(([type, count]) => ({ name: type.replace("_", " "), value: count }));

  // team productivity by user (leaders only — uses full team logs regardless of filtered `logs` above)
  const userCount: Record<string, number> = {};
  for (const log of allLogsForTeam) {
    userCount[log.userId] = (userCount[log.userId] ?? 0) + 1;
  }
  const productivity = isLeader
    ? Object.entries(userCount).map(([userId, count]) => ({
        name: userMap.get(userId) ?? "Unknown",
        count,
      }))
    : [];

  // CRM pipeline by status
  const statusCount: Record<string, number> = {};
  for (const c of teamContacts) {
    statusCount[c.status] = (statusCount[c.status] ?? 0) + 1;
  }
  const pipeline = ["lead", "contacted", "responded", "meeting_scheduled", "negotiating", "confirmed", "lost"].map(
    (status) => ({ status: status.replace("_", " "), count: statusCount[status] ?? 0 })
  );

  return (
    <PageWrap>
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <BarChart3 size={26} className="text-yellow-400" />
          Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">{isLeader ? "Team performance overview" : "Your performance overview"}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5">
          <p className="text-2xl font-bold text-white">{logs.length}</p>
          <p className="text-xs text-gray-500">Total Activities</p>
        </div>
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5">
          <p className="text-2xl font-bold text-white">{logs.filter((l) => l.type === "email").length}</p>
          <p className="text-xs text-gray-500">Emails Sent</p>
        </div>
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5">
          <p className="text-2xl font-bold text-white">{logs.filter((l) => l.type === "call").length}</p>
          <p className="text-xs text-gray-500">Calls Made</p>
        </div>
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5">
          <p className="text-2xl font-bold text-white">{teamContacts.length}</p>
          <p className="text-xs text-gray-500">Total Contacts</p>
        </div>
      </div>

      <AnalyticsCharts timeSeries={timeSeries} breakdown={breakdown} productivity={productivity} pipeline={pipeline} />
    </div>
    </PageWrap>
  );
}
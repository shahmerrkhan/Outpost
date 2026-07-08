import { db } from "@/../db";
import { outreachLogs, teamMembers, teams } from "@/../db/schema";
import { eq } from "drizzle-orm";
import { ensureDbUser } from "@/app/actions/user";
import { getActiveContext } from "@/app/actions/session-context";
import { redirect } from "next/navigation";
import PageWrap from "@/app/components/PageWrap";
import { Mail, Phone, Calendar, Flame } from "lucide-react";
import { getTeamAnnouncements, getTeamCredentials } from "@/app/actions/team-extras";
import AnnouncementsCard from "@/app/components/AnnouncementsCard";
import CredentialsCard from "@/app/components/CredentialsCard";

export default async function Dashboard() {
  const dbUser = await ensureDbUser();

  if (!dbUser.onboarded) {
    redirect("/onboarding");
  }

  const active = await getActiveContext();

  const [myMembership] = await db.select().from(teamMembers).where(eq(teamMembers.userId, dbUser.id));
  if (!myMembership) {
    redirect("/teams");
  }

  const myMemberships = await db.select().from(teamMembers).where(eq(teamMembers.userId, dbUser.id));
  const myTeamId = active.teamId ?? myMemberships[0]?.teamId;

  const allMyLogs = await db.select().from(outreachLogs).where(eq(outreachLogs.userId, dbUser.id));
  const myLogs = myTeamId ? allMyLogs.filter((l) => l.teamId === myTeamId) : allMyLogs;
  const emails = myLogs.filter((l) => l.type === "email").length;
  const calls = myLogs.filter((l) => l.type === "call").length;
  const meetings = myLogs.filter((l) => l.type === "meeting").length;

  let teamName = "No team yet";
  if (myTeamId) {
    const [team] = await db.select().from(teams).where(eq(teams.id, myTeamId));
    teamName = team?.name ?? teamName;
  }

  const recentLogs = [...myLogs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 6);

  const announcements = myTeamId ? await getTeamAnnouncements(myTeamId) : [];
  const credentials = myTeamId ? await getTeamCredentials(myTeamId) : [];
  const isFounder = myTeamId ? (await db.select().from(teams).where(eq(teams.id, myTeamId)))[0]?.leaderId === dbUser.id : false;

  return (
    <PageWrap>
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-gray-500 text-sm">Good to see you</p>
        <h1 className="text-3xl font-bold text-white">{dbUser.name}</h1>
        <p className="text-gray-500 text-sm mt-1">{teamName}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-yellow-400/30 hover:shadow-lg hover:shadow-black/30">
          <Mail size={18} className="text-yellow-400 mb-3" />
          <p className="text-2xl font-bold text-white">{emails}</p>
          <p className="text-xs text-gray-500">Emails Sent</p>
        </div>
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-lg hover:shadow-black/30">
          <Phone size={18} className="text-blue-400 mb-3" />
          <p className="text-2xl font-bold text-white">{calls}</p>
          <p className="text-xs text-gray-500">Calls Made</p>
        </div>
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400/30 hover:shadow-lg hover:shadow-black/30">
          <Calendar size={18} className="text-purple-400 mb-3" />
          <p className="text-2xl font-bold text-white">{meetings}</p>
          <p className="text-xs text-gray-500">Meetings</p>
        </div>
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-orange-400/30 hover:shadow-lg hover:shadow-black/30">
          <Flame size={18} className="text-orange-400 mb-3" />
          <p className="text-2xl font-bold text-white">{myLogs.length}</p>
          <p className="text-xs text-gray-500">Total Activities</p>
        </div>
      </div>

      {myTeamId && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <AnnouncementsCard teamId={myTeamId} announcements={announcements} isFounder={isFounder} />
          <CredentialsCard teamId={myTeamId} credentials={credentials} isFounder={isFounder} />
        </div>
      )}

      <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
        {recentLogs.length === 0 ? (
          <p className="text-gray-500 text-sm">No activity logged yet. Head to the CRM to start.</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm border-b border-[#26262f] pb-3 last:border-0">
                <div>
                  <span className="text-gray-300 capitalize">{log.type.replace("_", " ")}</span>
                  {log.company && <span className="text-gray-500"> · {log.company}</span>}
                  {log.notes && <p className="text-xs text-gray-600 mt-0.5">{log.notes}</p>}
                </div>
                <span className="text-gray-500 text-xs whitespace-nowrap">{log.createdAt.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </PageWrap>
  );
}
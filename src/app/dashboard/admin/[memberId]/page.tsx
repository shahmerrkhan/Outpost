import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/../db";
import { users, teamMembers, teams } from "@/../db/schema";
import { eq } from "drizzle-orm";
import { getMemberDetail } from "@/app/actions/admin";
import ActivityHeatmap from "@/app/components/ActivityHeatmap";
import PageWrap from "@/app/components/PageWrap";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";

export default async function MemberDetailPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser.id));
  if (!dbUser) redirect("/sign-in");

  const [membership] = await db.select().from(teamMembers).where(eq(teamMembers.userId, dbUser.id));
  if (!membership) redirect("/dashboard");

  const [team] = await db.select().from(teams).where(eq(teams.id, membership.teamId));
  if (!team || team.leaderId !== dbUser.id) redirect("/dashboard");

  const detail = await getMemberDetail(team.id, memberId);

  const emails = detail.byType["email"] ?? 0;
  const calls = detail.byType["call"] ?? 0;
  const meetings = detail.byType["meeting"] ?? 0;

  return (
    <PageWrap>
      <div className="min-h-screen bg-[#0a0a0f] p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard/admin" className="text-gray-500 text-sm flex items-center gap-1 mb-4 hover:text-white">
            <ArrowLeft size={14} /> Back to Members
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">{detail.member.name}</h1>
              <p className="text-gray-500 text-sm">{detail.member.email}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{detail.totalLogs}</p>
              <p className="text-xs text-gray-500">total activities</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5">
              <Mail size={18} className="text-yellow-400 mb-3" />
              <p className="text-2xl font-bold text-white">{emails}</p>
              <p className="text-xs text-gray-500">Emails</p>
            </div>
            <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5">
              <Phone size={18} className="text-blue-400 mb-3" />
              <p className="text-2xl font-bold text-white">{calls}</p>
              <p className="text-xs text-gray-500">Calls</p>
            </div>
            <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5">
              <Calendar size={18} className="text-purple-400 mb-3" />
              <p className="text-2xl font-bold text-white">{meetings}</p>
              <p className="text-xs text-gray-500">Meetings</p>
            </div>
          </div>

          <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-6 mb-8">
            <h2 className="text-white font-semibold mb-4">Activity Heatmap</h2>
            <ActivityHeatmap byDay={detail.byDay} />
          </div>

          <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
            {detail.recentLogs.length === 0 ? (
              <p className="text-gray-500 text-sm">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {detail.recentLogs.map((log) => (
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
      </div>
    </PageWrap>
  );
}
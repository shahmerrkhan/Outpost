import { db } from "@/../db";
import { outreachLogs, users, teamMembers } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import PageWrap from "@/app/components/PageWrap";
import { Trophy } from "lucide-react";
import { getActiveContext } from "@/app/actions/session-context";

export default async function LeaderboardPage() {
  const clerkUser = await currentUser();
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser!.id));
  if (!dbUser.onboarded) redirect("/onboarding");

  const active = await getActiveContext();
  const myMemberships = await db.select().from(teamMembers).where(eq(teamMembers.userId, dbUser.id));
  const myTeamId = active.teamId ?? myMemberships[0]?.teamId;

  if (!myTeamId) {
    return (
      <PageWrap>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-12 text-center">
          <p className="text-gray-400">Join a team first to see the leaderboard.</p>
        </div>
      </div>
      </PageWrap>
    );
  }

  const results = await db
    .select({
      userId: outreachLogs.userId,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(outreachLogs)
    .where(eq(outreachLogs.teamId, myTeamId))
    .groupBy(outreachLogs.userId);

  const allUsers = await db.select().from(users);
  const userMap = new Map(allUsers.map((u) => [u.id, u.name]));

  const ranked = results
    .map((r) => ({ name: userMap.get(r.userId) ?? "Unknown", count: Number(r.count) }))
    .sort((a, b) => b.count - a.count);

  const medalColors = ["text-yellow-400", "text-gray-300", "text-orange-400"];

  return (
    <PageWrap>
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Trophy size={26} className="text-yellow-400" />
          Leaderboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">Ranked by total activities logged</p>
      </div>

      {ranked.length === 0 ? (
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-12 text-center">
          <p className="text-gray-500">No activity logged yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranked.map((r, i) => (
            <div
              key={i}
              className={`bg-[#14141c] border rounded-xl p-5 flex items-center justify-between ${
                i === 0 ? "border-yellow-400/40" : "border-[#26262f]"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold w-8 ${medalColors[i] ?? "text-gray-600"}`}>
                  #{i + 1}
                </span>
                <span className="text-white font-medium">{r.name}</span>
              </div>
              <span className="text-xl font-bold text-white">{r.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
    </PageWrap>
  );
}
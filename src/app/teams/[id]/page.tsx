import { db } from "@/../db";
import { teams, teamMembers, users, joinRequests } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { respondToRequest } from "@/app/actions/teams";
import { setActiveContext } from "@/app/actions/session-context";
import AnimatedButton from "@/app/components/AnimatedButton";
import PageWrap from "@/app/components/PageWrap";
import { Users, Crown } from "lucide-react";

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clerkUser = await currentUser();
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser!.id));
  if (!dbUser.onboarded) redirect("/onboarding");

  const [team] = await db.select().from(teams).where(eq(teams.id, id));
  if (!team) {
    return (
      <PageWrap>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-12 text-center">
          <p className="text-gray-400">Team not found.</p>
        </div>
      </div>
      </PageWrap>
    );
  }

  const isLeader = team.leaderId === dbUser.id;

  const members = await db
    .select({ userId: teamMembers.userId, name: users.name, email: users.email })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.status, "active")));

  const isMember = members.some((m) => m.userId === dbUser.id) || isLeader;

  async function handleGoToDashboard() {
    "use server";
    await setActiveContext(team.id, isLeader ? "founder" : "member");
    redirect("/dashboard");
  }

  const pending = isLeader
    ? await db
        .select({ id: joinRequests.id, userId: joinRequests.userId, name: users.name })
        .from(joinRequests)
        .innerJoin(users, eq(joinRequests.userId, users.id))
        .where(and(eq(joinRequests.teamId, team.id), eq(joinRequests.status, "pending")))
    : [];

  async function handleRespond(formData: FormData) {
    "use server";
    const requestId = formData.get("requestId") as string;
    const approve = formData.get("approve") === "true";
    await respondToRequest(requestId, approve);
  }

  return (
    <PageWrap>
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{team.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{team.description || "No description"}</p>
        </div>
        {isMember && (
          <form action={handleGoToDashboard}>
            <AnimatedButton type="submit" className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg text-sm">
              Go to Dashboard
            </AnimatedButton>
          </form>
        )}
      </div>

      {isLeader && pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
            Pending Requests
          </h2>
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="bg-[#14141c] border border-yellow-400/30 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white">{p.name}</span>
                <form action={handleRespond} className="flex gap-2">
                  <input type="hidden" name="requestId" value={p.id} />
                  <AnimatedButton type="submit" name="approve" value="true" className="bg-green-500/10 text-green-400 px-4 py-1.5 rounded-lg text-sm font-medium">
                    Approve
                  </AnimatedButton>
                  <AnimatedButton type="submit" name="approve" value="false" className="bg-red-500/10 text-red-400 px-4 py-1.5 rounded-lg text-sm font-medium">
                    Deny
                  </AnimatedButton>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500 flex items-center gap-2">
        <Users size={14} />
        Members ({members.length})
      </h2>
      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.userId} className="bg-[#14141c] border border-[#26262f] rounded-xl p-4 text-sm flex items-center justify-between">
            <span className="text-white flex items-center gap-2">
              {m.userId === team.leaderId && <Crown size={14} className="text-yellow-400" />}
              {m.name}
            </span>
            <span className="text-gray-500">{m.email}</span>
          </div>
        ))}
      </div>
    </div>
    </PageWrap>
  );
}
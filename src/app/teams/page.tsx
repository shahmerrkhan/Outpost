import { db } from "@/../db";
import { teams, teamMembers, joinRequests } from "@/../db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createTeam, requestToJoin } from "@/app/actions/teams";
import { setActiveContext, getActiveContext } from "@/app/actions/session-context";
import TeamsGrid from "@/app/components/TeamsGrid";
import { ensureDbUser } from "@/app/actions/user";
import AnimatedButton from "@/app/components/AnimatedButton";
import PageWrap from "@/app/components/PageWrap";
import { Users, Plus } from "lucide-react";

export default async function TeamsPage() {
  const dbUser = await ensureDbUser();
  if (!dbUser.onboarded) redirect("/onboarding");

  const allTeams = await db.select().from(teams);
  const myMemberships = await db.select().from(teamMembers).where(eq(teamMembers.userId, dbUser.id));
  const myRequests = await db.select().from(joinRequests).where(eq(joinRequests.userId, dbUser.id));
  const myFounderTeams = await db.select().from(teams).where(eq(teams.leaderId, dbUser.id));
  const isFounder = myFounderTeams.length > 0;
  const active = await getActiveContext();

  const myTeamIds = new Set(myMemberships.map((m) => m.teamId));
  const pendingTeamIds = new Set(
    myRequests.filter((r) => r.status === "pending").map((r) => r.teamId)
  );

  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    await createTeam(name, description);
  }

  async function handleJoin(formData: FormData) {
    "use server";
    const teamId = formData.get("teamId") as string;
    await requestToJoin(teamId);
  }

  async function handleGoToTeam(formData: FormData) {
    "use server";
    const teamId = formData.get("teamId") as string;
    const mode = formData.get("mode") as "founder" | "member";
    await setActiveContext(teamId, mode);
    redirect("/dashboard");
  }

  return (
    <PageWrap>
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Teams</h1>
          <p className="text-gray-500 text-sm mt-1">Browse teams or start your own</p>
        </div>
      </div>

      <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-6 mb-8 transition-all duration-300 hover:border-[#33333f]">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Plus size={18} className="text-yellow-400" />
          {isFounder ? "Start another team" : "Tired of waiting? Start your own team"}
        </h2>
        <form action={handleCreate} className="space-y-3">
          <input
            name="name"
            placeholder="Team name"
            required
            className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 w-full rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-200"
          />
          <textarea
            name="description"
            placeholder="What is this team about?"
            className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 w-full rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-200"
          />
          <AnimatedButton type="submit" className="bg-yellow-400 text-black font-semibold px-5 py-2.5 rounded-lg text-sm">
            Create Team
          </AnimatedButton>
        </form>
      </div>

      <h2 className="text-white font-semibold mb-4">All Teams</h2>
      <TeamsGrid
        allTeams={allTeams}
        myTeamIds={Array.from(myTeamIds)}
        pendingTeamIds={Array.from(pendingTeamIds)}
        activeTeamId={active.teamId}
        dbUserId={dbUser.id}
        handleJoin={handleJoin}
        handleGoToTeam={handleGoToTeam}
      />
    </div>
    </PageWrap>
  );
}
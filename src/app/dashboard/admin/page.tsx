import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/../db";
import { users, teamMembers, teams } from "@/../db/schema";
import { eq } from "drizzle-orm";
import { getTeamOversight } from "@/app/actions/admin";
import AdminMemberTable from "@/app/components/AdminMemberTable";
import TeamRenameForm from "@/app/components/TeamRenameForm";

export default async function AdminPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser.id));
  if (!dbUser) redirect("/sign-in");

  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, dbUser.id));

  if (!membership) redirect("/dashboard");

  const [team] = await db.select().from(teams).where(eq(teams.id, membership.teamId));

  if (!team || team.leaderId !== dbUser.id) redirect("/dashboard");

  const oversight = await getTeamOversight(team.id);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-1">Team Admin</h1>
        <p className="text-gray-500 text-sm mb-6">{team.name} · Founder view</p>

        <TeamRenameForm teamId={team.id} currentName={team.name} />

        <AdminMemberTable teamId={team.id} members={oversight} />
      </div>
    </div>
  );
}
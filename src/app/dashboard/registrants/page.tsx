import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/../db";
import { users, teamMembers } from "@/../db/schema";
import { eq } from "drizzle-orm";
import { getRegistrants } from "@/app/actions/registrants";
import RegistrantsTable from "@/app/components/RegistrantsTable";

export default async function RegistrantsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser.id));
  if (!dbUser) redirect("/sign-in");

  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, dbUser.id));

  if (!membership) redirect("/dashboard");

  const registrants = await getRegistrants(membership.teamId);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-1">Registrants</h1>
        <p className="text-gray-500 text-sm mb-6">Participant CRM</p>

        <RegistrantsTable teamId={membership.teamId} registrants={registrants} />
      </div>
    </div>
  );
}
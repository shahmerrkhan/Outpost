import { db } from "@/../db";
import { contacts, teamMembers, users } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getActiveContext } from "@/app/actions/session-context";
import PageWrap from "@/app/components/PageWrap";
import CrmPageClient from "@/app/components/CrmPageClient";

export default async function CrmPage() {
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
          <p className="text-gray-400">Join a team first to access the CRM.</p>
        </div>
      </div>
      </PageWrap>
    );
  }

  const teamContacts = await db.select().from(contacts).where(eq(contacts.teamId, myTeamId));

  return (
    <PageWrap>
    <div className="p-8 max-w-7xl mx-auto">
      <CrmPageClient teamId={myTeamId} initialContacts={teamContacts} />
    </div>
    </PageWrap>
  );
}
import { db } from "@/../db";
import { contacts, teamMembers, users } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { addContact } from "@/app/actions/outreach";
import { getActiveContext } from "@/app/actions/session-context";
import AnimatedButton from "@/app/components/AnimatedButton";
import PageWrap from "@/app/components/PageWrap";
import CrmBoard from "@/app/components/CrmBoard";
import { UserPlus } from "lucide-react";

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

  async function handleAddContact(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const company = formData.get("company") as string;
    await addContact(myTeamId!, name, email, company);
  }

  return (
    <PageWrap>
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">CRM Pipeline</h1>
          <p className="text-gray-500 text-sm mt-1">{teamContacts.length} contacts</p>
        </div>
      </div>

      <details className="bg-[#14141c] border border-[#26262f] rounded-xl p-6 mb-8">
        <summary className="text-white font-semibold cursor-pointer flex items-center gap-2">
          <UserPlus size={18} className="text-yellow-400" />
          Add Contact
        </summary>
        <form action={handleAddContact} className="grid grid-cols-3 gap-3 mt-4">
          <input name="name" placeholder="Name" required className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input name="email" placeholder="Email" className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input name="company" placeholder="Company" className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <AnimatedButton type="submit" className="col-span-3 bg-yellow-400 text-black font-semibold px-5 py-2.5 rounded-lg text-sm">
            Add Contact
          </AnimatedButton>
        </form>
      </details>

      <CrmBoard teamId={myTeamId} contacts={teamContacts} />
    </div>
    </PageWrap>
  );
}
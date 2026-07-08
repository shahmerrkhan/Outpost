import { getTeamMembersList } from "@/app/actions/team-members";
import PageWrap from "@/app/components/PageWrap";
import { Crown, Users } from "lucide-react";

export default async function TeamMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { team, members } = await getTeamMembersList(id);

  return (
    <PageWrap>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{team.name} — Members</h1>
          <p className="text-gray-500 text-sm mt-1">{members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="bg-[#14141c] border border-[#26262f] rounded-xl p-4 flex items-center justify-between transition-all duration-200 hover:border-[#3a3a45]">
              <div className="flex items-center gap-3">
                {m.id === team.leaderId ? (
                  <Crown size={18} className="text-yellow-400" />
                ) : (
                  <Users size={18} className="text-gray-500" />
                )}
                <div>
                  <p className="text-white font-medium">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.email}{m.school ? ` · ${m.school}` : ""}</p>
                </div>
              </div>
              {m.id === team.leaderId && (
                <span className="text-xs bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded-full">Founder</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageWrap>
  );
}
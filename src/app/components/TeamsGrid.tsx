"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import TeamSearch from "./TeamSearch";
import AnimatedButton from "./AnimatedButton";

type Team = { id: string; name: string; description: string | null; leaderId: string };

export default function TeamsGrid({
  allTeams,
  myTeamIds,
  pendingTeamIds,
  activeTeamId,
  dbUserId,
  handleJoin,
  handleGoToTeam,
}: {
  allTeams: Team[];
  myTeamIds: string[];
  pendingTeamIds: string[];
  activeTeamId: string | null;
  dbUserId: string;
  handleJoin: (formData: FormData) => void;
  handleGoToTeam: (formData: FormData) => void;
}) {
  const [query, setQuery] = useState("");
  const myTeamIdSet = new Set(myTeamIds);
  const pendingSet = new Set(pendingTeamIds);

  const filtered = allTeams.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      (t.description ?? "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <TeamSearch onSearch={setQuery} />
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((team) => (
          <div
            key={team.id}
            className={`bg-[#14141c] border rounded-xl p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 ${
              team.id === activeTeamId ? "border-yellow-400" : "border-[#26262f] hover:border-[#3a3a45]"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              {myTeamIdSet.has(team.id) ? (
                <form action={handleGoToTeam}>
                  <input type="hidden" name="teamId" value={team.id} />
                  <input type="hidden" name="mode" value={team.leaderId === dbUserId ? "founder" : "member"} />
                  <button type="submit" className="font-semibold text-white hover:text-yellow-400 transition flex items-center gap-2">
                    <Users size={16} />
                    {team.name}
                  </button>
                </form>
              ) : (
                <a href={`/teams/${team.id}`} className="font-semibold text-white hover:text-yellow-400 transition flex items-center gap-2">
                  <Users size={16} />
                  {team.name}
                </a>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4">{team.description || "No description"}</p>
            {team.id === activeTeamId && (
              <span className="text-xs bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded-full mr-2">Current</span>
            )}
            {team.leaderId === dbUserId ? (
              <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full">Founder</span>
            ) : myTeamIdSet.has(team.id) ? (
              <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">Member</span>
            ) : pendingSet.has(team.id) ? (
              <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full">Request Pending</span>
            ) : (
              <form action={handleJoin}>
                <input type="hidden" name="teamId" value={team.id} />
                <AnimatedButton type="submit" className="bg-[#1a1a24] border border-[#26262f] text-white px-4 py-1.5 rounded-lg text-xs">
                  Request to Join
                </AnimatedButton>
              </form>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-600 text-sm col-span-2 text-center py-8">No teams match your search.</p>
        )}
      </div>
    </>
  );
}
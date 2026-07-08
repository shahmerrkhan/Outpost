"use client";

import { useEffect, useState } from "react";
import { getUserTeamContext, getActiveContext } from "@/app/actions/session-context";
import TeamContextPicker from "@/app/components/TeamContextPicker";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [founderTeams, setFounderTeams] = useState<any[]>([]);
  const [memberTeams, setMemberTeams] = useState<any[]>([]);

  useEffect(() => {
    async function check() {
      const active = await getActiveContext();
      const ctx = await getUserTeamContext();

      const totalTeams = ctx.founderTeams.length + ctx.memberTeams.length;

      if (totalTeams === 0) {
        setChecking(false);
        return;
      }

      if (totalTeams === 1 && !active.teamId) {
        setFounderTeams(ctx.founderTeams);
        setMemberTeams(ctx.memberTeams);
        setShowPicker(true);
        setChecking(false);
        return;
      }

      if (!active.teamId) {
        setFounderTeams(ctx.founderTeams);
        setMemberTeams(ctx.memberTeams);
        setShowPicker(true);
        setChecking(false);
        return;
      }

      setChecking(false);
    }
    check();
  }, []);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-gray-500 text-sm">Loading...</div>;
  }

  return (
    <>
      {showPicker && (
        <TeamContextPicker
          founderTeams={founderTeams}
          memberTeams={memberTeams}
          onResolved={() => setShowPicker(false)}
        />
      )}
      {children}
    </>
  );
}
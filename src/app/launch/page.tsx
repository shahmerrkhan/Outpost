"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getUserTeamContext } from "@/app/actions/session-context";
import { setActiveContext } from "@/app/actions/session-context";
import { Crown, Users, ArrowRight } from "lucide-react";

type Team = { id: string; name: string; description: string | null };

export default function LaunchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [founderTeams, setFounderTeams] = useState<Team[]>([]);
  const [memberTeams, setMemberTeams] = useState<Team[]>([]);
  const [roleChoice, setRoleChoice] = useState<"founder" | "member" | null>(null);
  const [zooming, setZooming] = useState(false);

  useEffect(() => {
    getUserTeamContext().then((ctx) => {
      setFounderTeams(ctx.founderTeams);
      setMemberTeams(ctx.memberTeams);
      setLoading(false);
    });
  }, []);

  const isFounder = founderTeams.length > 0;
  const isMember = memberTeams.length > 0;
  const teamsForRole = roleChoice === "founder" ? founderTeams : memberTeams;

  async function handlePick(teamId: string, mode: "founder" | "member") {
    setZooming(true);
    await setActiveContext(teamId, mode);
    setTimeout(() => router.push("/dashboard"), 500);
  }

  if (loading) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {zooming ? (
          <motion.div key="zoom" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.3 }} className="text-gray-500 text-sm">
            Loading dashboard...
          </motion.div>
        ) : !roleChoice ? (
          <motion.div key="role" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Continue as</h2>
            <p className="text-gray-500 text-sm mb-8 text-center">Choose how you want to enter.</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => isFounder && setRoleChoice("founder")}
                disabled={!isFounder}
                className={`rounded-2xl p-6 text-left transition border ${
                  isFounder
                    ? "bg-white/5 border-white/10 hover:border-red-500/50 cursor-pointer"
                    : "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
                }`}
              >
                <Crown size={22} className="text-red-500 mb-3" />
                <p className="font-semibold text-white">Continue as Founder</p>
                {!isFounder && <p className="text-xs text-gray-600 mt-1">You aren&apos;t a founder of any team</p>}
              </button>
              <button
                onClick={() => isMember && setRoleChoice("member")}
                disabled={!isMember}
                className={`rounded-2xl p-6 text-left transition border ${
                  isMember
                    ? "bg-white/5 border-white/10 hover:border-red-500/50 cursor-pointer"
                    : "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
                }`}
              >
                <Users size={22} className="text-red-500 mb-3" />
                <p className="font-semibold text-white">Continue as Member</p>
                {!isMember && <p className="text-xs text-gray-600 mt-1">You aren&apos;t a member of any team</p>}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="teams" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Which team?</h2>
            <p className="text-gray-500 text-sm mb-8 text-center">
              {roleChoice === "founder" ? "Teams you lead." : "Teams you're part of."}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {teamsForRole.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handlePick(t.id, roleChoice)}
                  className="bg-white/5 border border-white/10 hover:border-red-500/50 rounded-2xl p-5 text-left transition flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    {t.description && <p className="text-xs text-gray-500 mt-1">{t.description}</p>}
                  </div>
                  <ArrowRight size={16} className="text-gray-500 shrink-0" />
                </button>
              ))}
            </div>
            <button onClick={() => setRoleChoice(null)} className="mt-6 text-sm text-gray-500 w-full text-center">
              Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
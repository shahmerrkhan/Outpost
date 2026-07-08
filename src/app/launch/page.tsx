"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getUserTeamContext, setActiveContext } from "@/app/actions/session-context";
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

  const teamsForRole = roleChoice === "founder" ? founderTeams : memberTeams;

  async function handlePick(teamId: string, mode: "founder" | "member") {
    setZooming(true);
    await setActiveContext(teamId, mode);
    setTimeout(() => router.push("/dashboard"), 500);
  }

  if (loading) return <div className="min-h-screen bg-black" />;

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
                onClick={() => setRoleChoice("founder")}
                className="rounded-2xl p-6 text-left transition border bg-white/5 border-white/10 hover:border-red-500/50"
              >
                <Crown size={22} className="text-red-500 mb-3" />
                <p className="font-semibold text-white">Continue as Founder</p>
              </button>
              <button
                onClick={() => setRoleChoice("member")}
                className="rounded-2xl p-6 text-left transition border bg-white/5 border-white/10 hover:border-red-500/50"
              >
                <Users size={22} className="text-red-500 mb-3" />
                <p className="font-semibold text-white">Continue as Member</p>
              </button>
            </div>
          </motion.div>
        ) : teamsForRole.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {roleChoice === "founder" ? "You don't lead any teams yet" : "You're not part of any teams yet"}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              {roleChoice === "founder" ? "Want to start one?" : "Want to browse and request to join one?"}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setRoleChoice(null)} className="border border-white/10 px-6 py-3 rounded-xl text-sm">
                Back
              </button>
              <button onClick={() => router.push("/teams")} className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-xl text-sm font-semibold">
                {roleChoice === "founder" ? "Start a team" : "Browse teams"}
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
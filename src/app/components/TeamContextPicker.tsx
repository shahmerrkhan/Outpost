"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { setActiveContext } from "@/app/actions/session-context";
import { Crown, Users, ArrowRight } from "lucide-react";

type Team = { id: string; name: string; description: string | null };

export default function TeamContextPicker({
  founderTeams,
  memberTeams,
  onResolved,
  forceRole,
}: {
  founderTeams: Team[];
  memberTeams: Team[];
  onResolved: () => void;
  forceRole?: "founder" | "member";
}) {
  const router = useRouter();
  const hasBoth = founderTeams.length > 0 && memberTeams.length > 0;

  const [roleChoice, setRoleChoice] = useState<"founder" | "member" | null>(
    forceRole ?? (hasBoth ? null : founderTeams.length > 0 ? "founder" : "member")
  );
  const [zooming, setZooming] = useState(false);

  const rawTeamsForRole = roleChoice === "founder" ? founderTeams : memberTeams;
  const teamsForRole = Array.from(new Map(rawTeamsForRole.map((t) => [t.id, t])).values());

  useEffect(() => {
    if (roleChoice && teamsForRole.length === 0) {
      router.push("/teams");
      onResolved();
    }
  }, [roleChoice]);
  const skipTeamPick = teamsForRole.length === 1;

  useEffect(() => {
    if (roleChoice && skipTeamPick) {
      handlePick(teamsForRole[0].id, roleChoice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleChoice]);

  async function handlePick(teamId: string, mode: "founder" | "member") {
    setZooming(true);
    await setActiveContext(teamId, mode);
    setTimeout(() => {
      router.push(mode === "founder" ? "/dashboard" : "/dashboard");
      onResolved();
    }, 650);
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {zooming ? (
          <motion.div
            key="zoom"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-500 text-sm"
          >
            Loading dashboard...
          </motion.div>
        ) : !roleChoice ? (
          <motion.div
            key="role"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Which mode?</h2>
            <p className="text-gray-500 text-sm mb-8 text-center">You&apos;re both a founder and a member.</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setRoleChoice("founder")}
                className="bg-white/5 border border-white/10 hover:border-red-500/50 rounded-2xl p-6 text-left transition"
              >
                <Crown size={22} className="text-red-500 mb-3" />
                <p className="font-semibold text-white">Founder Mode</p>
              </button>
              <button
                onClick={() => setRoleChoice("member")}
                className="bg-white/5 border border-white/10 hover:border-red-500/50 rounded-2xl p-6 text-left transition"
              >
                <Users size={22} className="text-red-500 mb-3" />
                <p className="font-semibold text-white">Member Mode</p>
              </button>
            </div>
          </motion.div>
        ) : teamsForRole.length === 0 ? null : !skipTeamPick ? (
          <motion.div
            key="teams"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Which team?</h2>
            <p className="text-gray-500 text-sm mb-8 text-center">
              {roleChoice === "founder" ? "Teams you lead." : "Teams you're part of."}
            </p>
            <div className="space-y-3">
              {teamsForRole.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handlePick(t.id, roleChoice)}
                  className="w-full bg-white/5 border border-white/10 hover:border-red-500/50 rounded-xl p-4 flex items-center justify-between text-left transition"
                >
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
                  </div>
                  <ArrowRight size={16} className="text-gray-500" />
                </button>
              ))}
            </div>
            {hasBoth && (
              <button onClick={() => setRoleChoice(null)} className="mt-4 text-sm text-gray-500 w-full text-center">
                Back
              </button>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
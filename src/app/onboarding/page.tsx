"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfileInfo, completeAsFounder, completeAsMember } from "@/app/actions/onboarding";
import { toActionError } from "@/app/lib/action-error";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Crown, Users } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [school, setSchool] = useState("");
  const [path, setPath] = useState<"founder" | "member" | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStep1Next() {
    setLoading(true);
    try {
      await saveProfileInfo(school);
      setStep(2);
    } catch (e) {
      alert(toActionError(e).message);
    }
    setLoading(false);
  }

  async function handleFounderSubmit() {
    if (!teamName.trim()) return;
    setLoading(true);
    try {
      await completeAsFounder(teamName, teamDesc);
      router.push("/dashboard");
    } catch (e) {
      alert(toActionError(e).message);
      setLoading(false);
    }
  }

  async function handleMemberSubmit() {
    setLoading(true);
    try {
      await completeAsMember();
      router.push("/dashboard");
    } catch (e) {
      alert(toActionError(e).message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(220,38,38,0.2), transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-red-500" : "bg-white/10"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-3xl font-bold mb-2">Tell us about you</h1>
              <p className="text-gray-500 mb-8">Just a couple quick details.</p>
              <div className="space-y-4">
                <input
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="School / Organization"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 p-4 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                onClick={handleStep1Next}
                disabled={loading}
                className="mt-8 w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                Continue <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {step === 2 && !path && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-3xl font-bold mb-2">How do you want to start?</h1>
              <p className="text-gray-500 mb-8">You can always create or join more later.</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPath("founder")}
                  className="bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-white/[0.07] rounded-2xl p-6 text-left transition"
                >
                  <Crown size={22} className="text-red-500 mb-3" />
                  <p className="font-semibold mb-1">Start a Team</p>
                  <p className="text-sm text-gray-500">Be the founder. Build your team from scratch.</p>
                </button>
                <button
                  onClick={() => setPath("member")}
                  className="bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-white/[0.07] rounded-2xl p-6 text-left transition"
                >
                  <Users size={22} className="text-red-500 mb-3" />
                  <p className="font-semibold mb-1">Join a Team</p>
                  <p className="text-sm text-gray-500">Find an existing team and request to join.</p>
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && path === "founder" && (
            <motion.div key="founder" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-3xl font-bold mb-2">Name your team</h1>
              <p className="text-gray-500 mb-8">You&apos;ll manage members and approve requests.</p>
              <div className="space-y-4">
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 p-4 rounded-xl focus:outline-none focus:border-red-500"
                />
                <textarea
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="What's this team about?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 p-4 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setPath(null)} className="flex-1 border border-white/10 py-3.5 rounded-xl">
                  Back
                </button>
                <button
                  onClick={handleFounderSubmit}
                  disabled={loading || !teamName.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-500 font-semibold py-3.5 rounded-xl disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Team"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && path === "member" && (
            <motion.div key="member" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-3xl font-bold mb-2">Find your team</h1>
              <p className="text-gray-500 mb-8">
                We&apos;ll take you to the team browser — request to join, and you&apos;re set once approved.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setPath(null)} className="flex-1 border border-white/10 py-3.5 rounded-xl">
                  Back
                </button>
                <button
                  onClick={handleMemberSubmit}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-500 font-semibold py-3.5 rounded-xl disabled:opacity-50"
                >
                  {loading ? "Setting up..." : "Browse Teams"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
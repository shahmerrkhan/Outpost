"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { requestToJoin } from "@/app/actions/teams";
import { Check } from "lucide-react";

export default function JoinTeamButton({ teamId }: { teamId: string }) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }
    setLoading(true);
    try {
      await requestToJoin(teamId);
      setSent(true);
    } catch {
      // already requested or already a member, just show sent state
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <span className="text-xs bg-green-500/10 text-green-400 px-4 py-2 rounded-full flex items-center gap-1.5 justify-center">
        <Check size={14} />
        Request Sent
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-full transition disabled:opacity-50"
    >
      {loading ? "Sending..." : "Join Team"}
    </button>
  );
}
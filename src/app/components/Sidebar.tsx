"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getUnreadCount, getMyTeamId, getOnboardedStatus } from "@/app/actions/teams";
import { getUserTeamContext, getActiveContext } from "@/app/actions/session-context";
import Image from "next/image";
import { LayoutDashboard, Users, Briefcase, Trophy, Bell, Plus, Radio, BarChart3, Sparkles } from "lucide-react";
import LogActivityModal from "./LogActivityModal";
import TeamContextPicker from "./TeamContextPicker";

type SidebarTeam = { id: string; name: string; description: string | null };

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/live-feed", label: "Live Feed", icon: Radio },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/crm", label: "CRM", icon: Briefcase },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/email-logger", label: "AI Email Logger", icon: Sparkles },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export default function Sidebar() {
  const { isSignedIn, isLoaded, user } = useUser();
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);
  const [founderTeams, setFounderTeams] = useState<any[]>([]);
  const [memberTeams, setMemberTeams] = useState<any[]>([]);
  const [activeMode, setActiveMode] = useState<"founder" | "member" | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [forceRole, setForceRole] = useState<"founder" | "member" | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function poll() {
      try {
        const c = await getUnreadCount();
        setCount(c);
      } catch {}
    }
    poll();
    const interval = setInterval(poll, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadTeam() {
      try {
        const t = await getMyTeamId();
        setTeamId(t);
        setHasTeam(!!t);
      } catch {
        setHasTeam(false);
      }
    }
    loadTeam();
    getUserTeamContext().then((ctx) => {
      setFounderTeams(ctx.founderTeams);
      setMemberTeams(ctx.memberTeams);
    }).catch(() => {});
    getActiveContext().then((active) => {
      setActiveMode(active.mode);
    }).catch(() => {});
    getOnboardedStatus().then((onboarded) => {
      setReady(true);
      if (!onboarded) setHasTeam(false);
    }).catch(() => setReady(true));
  }, [pathname]);

  if (!isLoaded || !isSignedIn) return null;
  if (pathname === "/onboarding") return null;
  if (pathname === "/") return null;
  if (!ready) return null;

  return (
    <>
      <aside className="w-64 h-screen bg-[#0d0d13] border-r border-[#1f1f28] flex flex-col fixed left-0 top-0">
        <Link href="/dashboard" className="p-6 border-b border-[#1f1f28] flex items-center gap-3 hover:opacity-80 transition">
          <Image src="/logo.png" alt="NGN Hacks" width={32} height={32} className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold text-white">Outpost</h1>
            <p className="text-xs text-gray-500">Command Center</p>
          </div>
        </Link>

        {(founderTeams.length > 0 || memberTeams.length > 0) && (
          <div className="px-3 pt-3">
            {founderTeams.length > 0 && memberTeams.length > 0 ? (
              <button
                onClick={() => {
                  setForceRole(activeMode === "founder" ? "member" : "founder");
                  setPickerOpen(true);
                }}
                className="w-full bg-[#0a0a0f] border border-[#1f1f28] hover:border-yellow-400/50 rounded-lg py-2 text-xs text-gray-300 transition"
              >
                Switch to {activeMode === "founder" ? "Member" : "Founder"} Mode
              </button>
            ) : founderTeams.length > 0 ? (
              <button
                onClick={() => {
                  setForceRole("member");
                  setPickerOpen(true);
                }}
                className="w-full bg-[#0a0a0f] border border-[#1f1f28] hover:border-yellow-400/50 rounded-lg py-2 text-xs text-gray-300 transition"
              >
                Become a Member
              </button>
            ) : (
              <button
                onClick={() => {
                  setForceRole("founder");
                  setPickerOpen(true);
                }}
                className="w-full bg-[#0a0a0f] border border-[#1f1f28] hover:border-yellow-400/50 rounded-lg py-2 text-xs text-gray-300 transition"
              >
                Become a Founder
              </button>
            )}
          </div>
        )}

        <div className="p-3">
          <button
            onClick={() => setModalOpen(true)}
            disabled={!teamId}
            className="w-full bg-yellow-400 text-black font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Plus size={16} />
            Log Activity
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {(hasTeam === false ? links.filter((l) => l.href === "/teams") : links).map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm relative overflow-hidden transition-all duration-200 ease-out ${
                  active
                    ? "bg-[#1a1a24] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#14141c] hover:translate-x-0.5"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-yellow-400 rounded-full" />
                )}
                <Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
                {label}
                {label === "Notifications" && count > 0 && (
                  <span className="ml-auto bg-red-600 text-white text-xs rounded-full px-1.5 animate-pulse">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1f1f28] flex items-center gap-3">
          <UserButton />
          <span className="text-sm text-gray-300">{user?.firstName}</span>
        </div>
      </aside>

      {modalOpen && teamId && (
        <LogActivityModal teamId={teamId} onClose={() => setModalOpen(false)} />
      )}

      {pickerOpen && (
        <TeamContextPicker
          founderTeams={founderTeams}
          memberTeams={memberTeams}
          forceRole={forceRole}
          onResolved={() => {
            setPickerOpen(false);
            getMyTeamId().then((t) => {
              setTeamId(t);
              setHasTeam(!!t);
            }).catch(() => {});
            getActiveContext().then((active) => {
              setActiveMode(active.mode);
            }).catch(() => {});
          }}
        />
      )}
    </>
  );
}
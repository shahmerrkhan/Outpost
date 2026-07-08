import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, Users, Radio, BarChart3, Sparkles, Shield, Zap } from "lucide-react";
import { getPublicTeams } from "@/app/actions/public";
import JoinTeamButton from "@/app/components/JoinTeamButton";

export default async function Home() {
  const user = await currentUser();
  if (user) redirect("/dashboard");

  const teams = await getPublicTeams();

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 800px 600px at 50% 0%, rgba(220,38,38,0.18), transparent 70%)",
        }}
      />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(220,38,38,0.25), transparent 70%)" }}
      />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <span className="font-bold text-lg tracking-tight">Outpost</span>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/sign-in" className="hover:text-white transition">Sign In</Link>
          <Link
            href="/sign-up"
            className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-xs text-gray-300 mb-8 backdrop-blur">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Built for teams that move fast
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          Run your team
          <br />
          <span className="bg-gradient-to-r from-red-500 via-red-400 to-white bg-clip-text text-transparent">
            like a command center
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed">
          Build teams, manage outreach, track performance, and keep everyone aligned —
          all from one place designed to move at your speed.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-up"
            className="group bg-red-600 hover:bg-red-500 text-white font-semibold px-7 py-3.5 rounded-full flex items-center gap-2 transition shadow-[0_0_30px_rgba(220,38,38,0.35)]"
          >
            Get Started
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/sign-in"
            className="border border-white/15 hover:border-white/30 px-7 py-3.5 rounded-full font-medium transition"
          >
            Sign In
          </Link>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-2">Everything your team needs</h2>
        <p className="text-gray-500 text-center mb-16">One platform, no context switching.</p>
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: Users, title: "Teams", desc: "Create or join a team in seconds. Founders approve, members contribute." },
            { icon: Radio, title: "Live Outreach", desc: "Log activity, track contacts, watch your team's feed update in real time." },
            { icon: BarChart3, title: "Analytics", desc: "See what's working. Every metric that matters, one dashboard." },
            { icon: Sparkles, title: "AI Email Logger", desc: "Paste any message. AI extracts and logs every contact automatically." },
            { icon: Shield, title: "Role-Based Access", desc: "Founders get admin control. Members get exactly what they need." },
            { icon: Zap, title: "Instant Notifications", desc: "Join requests, approvals, and announcements — delivered instantly." },
          ].map((f) => (
            <div
              key={f.title}
              className="border border-white/10 bg-white/[0.02] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/20 transition"
            >
              <f.icon size={20} className="text-red-500 mb-4" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {teams.length > 0 && (
        <section className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t border-white/5">
          <h2 className="text-3xl font-bold text-center mb-2">Active teams right now</h2>
          <p className="text-gray-500 text-center mb-16">Find one that fits, or start your own.</p>
          <div className="grid grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="border border-white/10 bg-white/[0.02] rounded-2xl p-6 flex flex-col">
                <h3 className="font-semibold mb-1">{team.name}</h3>
                <p className="text-sm text-gray-500 mb-4 flex-1">{team.description || "No description yet."}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{team.memberCount} member{team.memberCount !== 1 ? "s" : ""}</span>
                  <JoinTeamButton teamId={team.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center border-t border-white/5">
        <h2 className="text-3xl font-bold mb-4">Ready to move?</h2>
        <p className="text-gray-500 mb-8">Join a team or start your own in under a minute.</p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-7 py-3.5 rounded-full transition shadow-[0_0_30px_rgba(220,38,38,0.35)]"
        >
          Get Started
          <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-gray-600">
        Outpost — built for teams that move fast.
      </footer>
    </main>
  );
}
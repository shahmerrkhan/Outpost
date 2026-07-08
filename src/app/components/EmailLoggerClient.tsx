"use client";

import { useState, useEffect } from "react";
import PageWrap from "@/app/components/PageWrap";
import AnimatedButton from "@/app/components/AnimatedButton";
import { extractContacts } from "@/app/actions/ai-extract";
import { getMyTeamId } from "@/app/actions/teams";
import { toActionError } from "@/app/lib/action-error";
import { useRouter } from "next/navigation";
import { Sparkles, FileText, Zap, Layers } from "lucide-react";

export default function EmailLoggerClient() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; error?: string } | null>(null);

  useEffect(() => {
    getMyTeamId().then(setTeamId).catch(() => router.push("/onboarding"));
  }, []);

  async function handleExtract() {
    if (!teamId || !text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await extractContacts(teamId, text);
      setResult(res);
      if (res.count > 0) setText("");
    } catch (e) {
      setResult({ count: 0, error: toActionError(e).message });
    }
    setLoading(false);
  }

  return (
    <PageWrap>
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Sparkles size={26} className="text-yellow-400" />
          AI Email Logger
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Paste any email, LinkedIn message, or lead info — AI extracts all contacts and logs them automatically.
        </p>
      </div>

      {!teamId ? (
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-12 text-center">
          <p className="text-gray-400">Join a team first to use this feature.</p>
        </div>
      ) : (
        <>
          <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-6 mb-6">
            <label className="text-xs uppercase tracking-wide text-gray-500 mb-3 block flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-400" />
              Paste your email or lead info below
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={`"Hi, I'm Sarah Chen from TechCorp... also CC'd is Mike Ross at VentureX..."\n\nAI will extract every contact mentioned.`}
              className="w-full bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-4 rounded-lg text-sm focus:outline-none focus:border-yellow-400"
            />
            <AnimatedButton
              onClick={handleExtract}
              disabled={loading || !text.trim()}
              className="w-full mt-4 bg-yellow-400 text-black font-semibold py-3 rounded-lg text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              {loading ? "Extracting..." : "Extract All Contacts"}
            </AnimatedButton>
          </div>

          {result && (
            <div className={`rounded-xl p-4 mb-6 text-sm ${result.error ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
              {result.error ?? `Successfully extracted and logged ${result.count} contact(s) to the CRM.`}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-4 text-center">
              <FileText size={18} className="text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Paste</p>
              <p className="text-xs text-gray-500">Any email, message, or notes</p>
            </div>
            <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-4 text-center">
              <Zap size={18} className="text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">AI Extracts</p>
              <p className="text-xs text-gray-500">All contacts mentioned</p>
            </div>
            <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-4 text-center">
              <Layers size={18} className="text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Bulk Logged</p>
              <p className="text-xs text-gray-500">All contacts → CRM at once</p>
            </div>
          </div>
        </>
      )}
    </div>
    </PageWrap>
  );
}
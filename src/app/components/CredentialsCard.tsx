"use client";

import { useState } from "react";
import { addCredential } from "@/app/actions/team-extras";
import { toActionError } from "@/app/lib/action-error";
import { KeyRound, Eye, EyeOff } from "lucide-react";

export default function CredentialsCard({
  teamId,
  credentials,
  isFounder,
}: {
  teamId: string;
  credentials: any[];
  isFounder: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!label.trim() || !username.trim() || !password.trim()) return;
    setSaving(true);
    try {
      await addCredential(teamId, label, site, username, password);
      window.location.reload();
    } catch (e) {
      alert(toActionError(e).message);
      setSaving(false);
    }
  }

  return (
    <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
          <KeyRound size={16} className="text-yellow-400" />
          Shared Credentials
        </h3>
        {isFounder && (
          <button onClick={() => setShowForm(!showForm)} className="text-xs text-yellow-400">
            {showForm ? "Cancel" : "+ Add"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="space-y-2 mb-4">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (e.g. Outreach Gmail)" className="w-full bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-2 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={site} onChange={(e) => setSite(e.target.value)} placeholder="Site (e.g. gmail.com)" className="w-full bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-2 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username / Email" className="w-full bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-2 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-2 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <button onClick={handleSave} disabled={saving} className="w-full bg-yellow-400 text-black text-sm font-semibold py-2 rounded-lg disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {credentials.length === 0 ? (
          <p className="text-gray-600 text-sm">No shared credentials yet.</p>
        ) : (
          credentials.map((c) => (
            <div key={c.id} className="bg-[#0a0a0f] border border-[#26262f] rounded-lg p-3">
              <p className="text-sm font-medium text-white">{c.label} <span className="text-gray-500 font-normal">· {c.site}</span></p>
              <p className="text-xs text-gray-400 mt-1">{c.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-400 font-mono">
                  {visible[c.id] ? c.password : "••••••••"}
                </p>
                <button onClick={() => setVisible((v) => ({ ...v, [c.id]: !v[c.id] }))} className="text-gray-500">
                  {visible[c.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
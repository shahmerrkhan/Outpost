"use client";

import { useState } from "react";
import { renameTeam } from "@/app/actions/admin";
import { Pencil, Check, X } from "lucide-react";

export default function TeamRenameForm({ teamId, currentName }: { teamId: string; currentName: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || name === currentName) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await renameTeam(teamId, name);
      setEditing(false);
    } catch (err) {
      alert("Failed to rename team");
      setName(currentName);
    }
    setSaving(false);
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors duration-150"
      >
        <Pencil size={14} />
        Rename team
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-6">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="bg-[#0a0a0f] border border-[#26262f] text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-green-400 hover:text-green-300 disabled:opacity-50"
      >
        <Check size={16} />
      </button>
      <button
        onClick={() => {
          setName(currentName);
          setEditing(false);
        }}
        className="text-red-400 hover:text-red-300"
      >
        <X size={16} />
      </button>
    </div>
  );
}
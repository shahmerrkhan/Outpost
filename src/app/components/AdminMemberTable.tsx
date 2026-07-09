"use client";

import { useState } from "react";
import { removeMember, updateMemberRole } from "@/app/actions/admin";
import { Trash2, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

type OversightMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  totalLogs: number;
  lastActive: Date | null;
};

function RoleDropdown({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const options = ["member", "lead"];

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-[#0a0a0f] border border-[#26262f] hover:border-[#3a3a45] text-white text-xs rounded-lg px-3 py-1.5 capitalize transition-colors duration-150 disabled:opacity-50"
      >
        {value}
        <ChevronDown size={12} className={`text-gray-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="absolute z-20 mt-1 bg-[#14141c] border border-[#26262f] rounded-lg overflow-hidden shadow-xl shadow-black/40 min-w-[100px]"
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs capitalize text-gray-300 hover:bg-[#1a1a24] hover:text-white transition-colors duration-100"
                >
                  {opt}
                  {value === opt && <Check size={12} className="text-yellow-400" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminMemberTable({
  teamId,
  members,
}: {
  teamId: string;
  members: OversightMember[];
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [localMembers, setLocalMembers] = useState(members);

  async function handleRemove(memberUserId: string) {
    if (!confirm("Remove this member from the team?")) return;
    setBusyId(memberUserId);
    try {
      await removeMember(teamId, memberUserId);
      setLocalMembers((prev) => prev.filter((m) => m.id !== memberUserId));
    } catch (err) {
      alert("Failed to remove member");
    }
    setBusyId(null);
  }

  async function handleRoleChange(memberUserId: string, role: string) {
    setBusyId(memberUserId);
    const prev = localMembers;
    setLocalMembers((p) => p.map((m) => (m.id === memberUserId ? { ...m, role } : m)));
    try {
      await updateMemberRole(teamId, memberUserId, role);
    } catch (err) {
      alert("Failed to update role");
      setLocalMembers(prev);
    }
    setBusyId(null);
  }

  return (
    <div className="bg-[#14141c] border border-[#26262f] rounded-xl overflow-visible">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#26262f] text-gray-500 text-left">
            <th className="p-3 font-medium">Name</th>
            <th className="p-3 font-medium">Email</th>
            <th className="p-3 font-medium">Role</th>
            <th className="p-3 font-medium">Logs</th>
            <th className="p-3 font-medium">Last Active</th>
            <th className="p-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {localMembers.map((m) => (
            <tr key={m.id} className="border-b border-[#26262f] last:border-0">
              <td className="p-3 text-white">
                <Link href={`/dashboard/admin/${m.id}`} className="hover:text-yellow-400 transition-colors duration-150">
                  {m.name}
                </Link>
              </td>
              <td className="p-3 text-gray-400">{m.email}</td>
              <td className="p-3">
                <span className="text-xs text-gray-400 capitalize bg-[#0a0a0f] border border-[#26262f] rounded-lg px-3 py-1.5">
                  {m.role}
                </span>
              </td>
              <td className="p-3 text-gray-400">{m.totalLogs}</td>
              <td className="p-3 text-gray-400">
                {m.lastActive ? new Date(m.lastActive).toLocaleDateString() : "Never"}
              </td>
              <td className="p-3 flex items-center gap-3">
                <Link
                  href={`/dashboard/admin/${m.id}`}
                  className="text-yellow-400 hover:text-yellow-300 text-xs font-medium"
                >
                  View Stats
                </Link>
                <button
                  onClick={() => handleRemove(m.id)}
                  disabled={busyId === m.id}
                  className="text-red-400 hover:text-red-300 transition-colors duration-150"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
          {localMembers.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-gray-600 text-sm">
                No other members yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

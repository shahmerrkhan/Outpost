"use client";

import { useState } from "react";
import { removeMember, updateMemberRole } from "@/app/actions/admin";
import { Trash2 } from "lucide-react";


type OversightMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  totalLogs: number;
  lastActive: Date | null;
};

export default function AdminMemberTable({
  teamId,
  members,
}: {
  teamId: string;
  members: OversightMember[];
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleRemove(memberUserId: string) {
    if (!confirm("Remove this member from the team?")) return;
    setBusyId(memberUserId);
    await removeMember(teamId, memberUserId);
    window.location.reload();
  }

  async function handleRoleChange(memberUserId: string, role: string) {
    setBusyId(memberUserId);
    await updateMemberRole(teamId, memberUserId, role);
    window.location.reload();
  }

  return (
    <div className="bg-[#14141c] border border-[#26262f] rounded-xl overflow-hidden">
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
          {members.map((m) => (
            <tr key={m.id} className="border-b border-[#26262f] last:border-0">
              <td className="p-3 text-white">{m.name}</td>
              <td className="p-3 text-gray-400">{m.email}</td>
              <td className="p-3">
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.id, e.target.value)}
                  disabled={busyId === m.id}
                  className="bg-[#0a0a0f] border border-[#26262f] text-white text-xs rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="member">Member</option>
                  <option value="lead">Lead</option>
                </select>
              </td>
              <td className="p-3 text-gray-400">{m.totalLogs}</td>
              <td className="p-3 text-gray-400">
                {m.lastActive ? new Date(m.lastActive).toLocaleDateString() : "Never"}
              </td>
              <td className="p-3">
                <button
                  onClick={() => handleRemove(m.id)}
                  disabled={busyId === m.id}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
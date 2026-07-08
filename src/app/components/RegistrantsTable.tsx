"use client";

import { useState } from "react";
import {
  addRegistrant,
  updateRegistrantStatus,
  updateRegistrantNotes,
  deleteRegistrant,
  RegistrantStatus,
} from "@/app/actions/registrants";
import { Trash2, UserPlus } from "lucide-react";

type Registrant = {
  id: string;
  name: string;
  email: string;
  school: string | null;
  grade: string | null;
  status: RegistrantStatus;
  notes: string | null;
};

export default function RegistrantsTable({
  teamId,
  registrants,
}: {
  teamId: string;
  registrants: Registrant[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    await addRegistrant(teamId, name, email, school, grade);
    setName("");
    setEmail("");
    setSchool("");
    setGrade("");
    setSaving(false);
    setShowForm(false);
    window.location.reload();
  }

  async function handleStatusChange(id: string, status: RegistrantStatus) {
    setBusyId(id);
    await updateRegistrantStatus(id, status);
    window.location.reload();
  }

  async function handleNotesBlur(id: string, notes: string) {
    await updateRegistrantNotes(id, notes);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this registrant?")) return;
    setBusyId(id);
    await deleteRegistrant(id);
    window.location.reload();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-500 text-sm">{registrants.length} total</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 bg-yellow-400 text-black text-sm font-semibold px-3 py-1.5 rounded-lg"
        >
          <UserPlus size={14} />
          {showForm ? "Cancel" : "Add Registrant"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-4 mb-4 grid grid-cols-2 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-2 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-2 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School" className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-2 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Grade" className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-2 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <button onClick={handleAdd} disabled={saving} className="col-span-2 bg-yellow-400 text-black text-sm font-semibold py-2 rounded-lg disabled:opacity-50">
            {saving ? "Saving..." : "Save Registrant"}
          </button>
        </div>
      )}

      <div className="bg-[#14141c] border border-[#26262f] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#26262f] text-gray-500 text-left">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">School</th>
              <th className="p-3 font-medium">Grade</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Notes</th>
              <th className="p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {registrants.map((r) => (
              <tr key={r.id} className="border-b border-[#26262f] last:border-0">
                <td className="p-3 text-white">{r.name}</td>
                <td className="p-3 text-gray-400">{r.email}</td>
                <td className="p-3 text-gray-400">{r.school}</td>
                <td className="p-3 text-gray-400">{r.grade}</td>
                <td className="p-3">
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value as RegistrantStatus)}
                    disabled={busyId === r.id}
                    className="bg-[#0a0a0f] border border-[#26262f] text-white text-xs rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="registered">Registered</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="attended">Attended</option>
                    <option value="no_show">No Show</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="p-3">
                  <input
                    defaultValue={r.notes || ""}
                    onBlur={(e) => handleNotesBlur(r.id, e.target.value)}
                    className="bg-[#0a0a0f] border border-[#26262f] text-white text-xs p-1.5 rounded-lg w-full focus:outline-none focus:border-yellow-400"
                  />
                </td>
                <td className="p-3">
                  <button onClick={() => handleDelete(r.id)} disabled={busyId === r.id} className="text-red-400 hover:text-red-300">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
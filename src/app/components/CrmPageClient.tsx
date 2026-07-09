"use client";

import { useState } from "react";
import { addContact } from "@/app/actions/outreach";
import { toActionError } from "@/app/lib/action-error";
import CrmBoard from "./CrmBoard";
import { UserPlus } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  linkedin: string | null;
  title: string | null;
  notes: string | null;
  status: string;
  contactType: string;
};

export default function CrmPageClient({ teamId, initialContacts }: { teamId: string; initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const contact = await addContact(teamId, name, email, company, phone, linkedin, title, notes);
      setContacts((prev) => [...prev, contact as Contact]);
      setName("");
      setEmail("");
      setCompany("");
      setPhone("");
      setLinkedin("");
      setTitle("");
      setNotes("");
    } catch (err) {
      alert(toActionError(err).message);
    }
    setSubmitting(false);
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">CRM Pipeline</h1>
          <p className="text-gray-500 text-sm mt-1">{contacts.length} contacts</p>
        </div>
      </div>

      <details className="bg-[#14141c] border border-[#26262f] rounded-xl p-6 mb-8">
        <summary className="text-white font-semibold cursor-pointer flex items-center gap-2">
          <UserPlus size={18} className="text-yellow-400" />
          Add Contact
        </summary>
        <form onSubmit={handleAdd} className="grid grid-cols-3 gap-3 mt-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job Title" className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL" className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="col-span-3 bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <button type="submit" disabled={submitting} className="col-span-3 bg-yellow-400 text-black font-semibold px-5 py-2.5 rounded-lg text-sm disabled:opacity-50">
            {submitting ? "Adding..." : "Add Contact"}
          </button>
        </form>
      </details>

      <CrmBoard teamId={teamId} contacts={contacts} />
    </>
  );
}
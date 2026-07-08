"use client";

import { useState } from "react";
import { updateContactStatus } from "@/app/actions/outreach";
import CustomDropdown from "./CustomDropdown";

const COLUMNS = [
  { key: "lead", label: "Lead", color: "border-gray-500" },
  { key: "contacted", label: "Contacted", color: "border-blue-500" },
  { key: "responded", label: "Responded", color: "border-cyan-500" },
  { key: "meeting_scheduled", label: "Meeting Scheduled", color: "border-purple-500" },
  { key: "negotiating", label: "Negotiating", color: "border-yellow-500" },
  { key: "confirmed", label: "Confirmed", color: "border-green-500" },
  { key: "lost", label: "Lost", color: "border-red-500" },
];

type Contact = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  status: string;
  contactType: string;
};

export default function CrmBoard({ contacts }: { contacts: Contact[] }) {
  const [localContacts, setLocalContacts] = useState(contacts);

  async function moveCard(id: string, newStatus: string) {
    setLocalContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    await updateContactStatus(id, newStatus);
  }

  return (
    <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-4">
      {COLUMNS.map((col) => {
        const items = localContacts.filter((c) => c.status === col.key);
        return (
          <div key={col.key} className="min-w-[260px] flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">{col.label}</h3>
              <span className="text-xs text-gray-500 bg-[#1a1a24] px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div className={`space-y-2 border-t-2 ${col.color} pt-3 overflow-visible`}>
              {items.map((c) => (
                <div key={c.id} className="bg-[#14141c] border border-[#26262f] rounded-lg p-3 transition-all duration-250 ease-out hover:-translate-y-0.5 hover:border-[#3a3a45] hover:shadow-md hover:shadow-black/30">
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{c.company}</p>
                  <CustomDropdown
                    value={c.status}
                    options={COLUMNS}
                    onChange={(newStatus) => moveCard(c.id, newStatus)}
                  />
                </div>
              ))}
              {items.length === 0 && (
                <div className="border border-dashed border-[#26262f] rounded-lg p-4 text-center text-xs text-gray-600">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
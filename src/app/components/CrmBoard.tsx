"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { updateContactStatus, updateContactDetails } from "@/app/actions/outreach";
import { toActionError } from "@/app/lib/action-error";

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
  phone: string | null;
  linkedin: string | null;
  title: string | null;
  notes: string | null;
  status: string;
  contactType: string;
};

function DraggableCard({ contact, onOpen }: { contact: Contact; onOpen: (c: Contact) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: contact.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.4 : 1 }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(contact)}
      className="bg-[#14141c] border border-[#26262f] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[#3a3a45] touch-none"
    >
      <p className="text-sm font-medium text-white">{contact.name}</p>
      <p className="text-xs text-gray-500">{contact.title ? `${contact.title} · ` : ""}{contact.company}</p>
    </div>
  );
}

function DroppableColumn({ col, items, onOpen }: { col: (typeof COLUMNS)[number]; items: Contact[]; onOpen: (c: Contact) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });
  return (
    <div className="min-w-[260px] flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">{col.label}</h3>
        <span className="text-xs text-gray-500 bg-[#1a1a24] px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-2 border-t-2 ${col.color} pt-3 min-h-[80px] rounded-b-lg transition-colors duration-150 ${
          isOver ? "bg-white/[0.03]" : ""
        }`}
      >
        {items.map((c) => (
          <DraggableCard key={c.id} contact={c} onOpen={onOpen} />
        ))}
        {items.length === 0 && (
          <div className="border border-dashed border-[#26262f] rounded-lg p-4 text-center text-xs text-gray-600">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

export default function CrmBoard({ teamId, contacts }: { teamId: string; contacts: Contact[] }) {
  const [localContacts, setLocalContacts] = useState(contacts);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openContact, setOpenContact] = useState<Contact | null>(null);

  useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const contactId = active.id as string;
    const newStatus = over.id as string;
    const contact = localContacts.find((c) => c.id === contactId);
    if (!contact || contact.status === newStatus) return;

    const prevContacts = localContacts;
    setLocalContacts((prev) => prev.map((c) => (c.id === contactId ? { ...c, status: newStatus } : c)));
    try {
      await updateContactStatus(teamId, contactId, newStatus);
    } catch (err) {
      alert(toActionError(err).message);
      setLocalContacts(prevContacts);
    }
  }

  const activeContact = localContacts.find((c) => c.id === activeId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-4">
        {COLUMNS.map((col) => (
          <DroppableColumn key={col.key} col={col} items={localContacts.filter((c) => c.status === col.key)} onOpen={setOpenContact} />
        ))}
      </div>
      <DragOverlay>
        {activeContact ? (
          <div className="bg-[#14141c] border border-yellow-400 rounded-lg p-3 shadow-xl shadow-black/50 w-[228px]">
            <p className="text-sm font-medium text-white">{activeContact.name}</p>
            <p className="text-xs text-gray-500">{activeContact.company}</p>
          </div>
        ) : null}
      </DragOverlay>
      {openContact && (
        <ContactDetailModal
          teamId={teamId}
          contact={openContact}
          onClose={() => setOpenContact(null)}
          onSaved={(updated) => {
            setLocalContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setOpenContact(null);
          }}
        />
      )}
    </DndContext>
  );
}

function ContactDetailModal({
  teamId,
  contact,
  onClose,
  onSaved,
}: {
  teamId: string;
  contact: Contact;
  onClose: () => void;
  onSaved: (c: Contact) => void;
}) {
  const [phone, setPhone] = useState(contact.phone ?? "");
  const [linkedin, setLinkedin] = useState(contact.linkedin ?? "");
  const [title, setTitle] = useState(contact.title ?? "");
  const [notes, setNotes] = useState(contact.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateContactDetails(teamId, contact.id, phone, linkedin, title, notes);
      onSaved({ ...contact, phone, linkedin, title, notes });
    } catch (err) {
      alert(toActionError(err).message);
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-white font-semibold mb-1">{contact.name}</h3>
        <p className="text-xs text-gray-500 mb-4">{contact.email || "No email"} {contact.company ? `· ${contact.company}` : ""}</p>
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" className="w-full bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL" className="w-full bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={4} className="w-full bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 border border-[#26262f] text-gray-300 py-2.5 rounded-lg text-sm">Close</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-yellow-400 text-black font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
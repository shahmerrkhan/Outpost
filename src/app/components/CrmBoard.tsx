"use client";

import { useState } from "react";
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
import { updateContactStatus } from "@/app/actions/outreach";
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
  status: string;
  contactType: string;
};

function DraggableCard({ contact }: { contact: Contact }) {
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
      className="bg-[#14141c] border border-[#26262f] rounded-lg p-3 cursor-grab active:cursor-grabbing transition-shadow duration-150 hover:-translate-y-0.5 hover:border-[#3a3a45] hover:shadow-md hover:shadow-black/30 touch-none"
    >
      <p className="text-sm font-medium text-white">{contact.name}</p>
      <p className="text-xs text-gray-500">{contact.company}</p>
    </div>
  );
}

function DroppableColumn({ col, items }: { col: (typeof COLUMNS)[number]; items: Contact[] }) {
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
          <DraggableCard key={c.id} contact={c} />
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
          <DroppableColumn key={col.key} col={col} items={localContacts.filter((c) => c.status === col.key)} />
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
    </DndContext>
  );
}
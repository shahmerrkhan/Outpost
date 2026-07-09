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
import { createTask, updateTaskStatus } from "@/app/actions/tasks";
import { toActionError } from "@/app/lib/action-error";
import { Plus } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  assigneeId: string | null;
  assigneeName: string | null;
};

const COLUMNS = [
  { key: "open", label: "Open", color: "border-gray-500" },
  { key: "in_progress", label: "In Progress", color: "border-blue-500" },
  { key: "done", label: "Done", color: "border-green-500" },
];

const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-400",
  medium: "bg-yellow-500/10 text-yellow-400",
  high: "bg-red-500/10 text-red-400",
};

function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.4 : 1 }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-[#14141c] border border-[#26262f] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[#3a3a45] touch-none"
    >
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-medium text-white">{task.title}</p>
        <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
      </div>
      {task.description && <p className="text-xs text-gray-500 mb-2">{task.description}</p>}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{task.assigneeName ?? "Unassigned"}</span>
        {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
      </div>
    </div>
  );
}

function DroppableColumn({ col, items }: { col: (typeof COLUMNS)[number]; items: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });
  return (
    <div>
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
        {items.map((t) => (
          <DraggableTask key={t.id} task={t} />
        ))}
        {items.length === 0 && (
          <div className="border border-dashed border-[#26262f] rounded-lg p-4 text-center text-xs text-gray-600">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksBoard({
  teamId,
  initialTasks,
  members,
}: {
  teamId: string;
  initialTasks: Task[];
  members: { id: string; name: string }[];
}) {
  const [tasksList, setTasksList] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const task = await createTask(teamId, title, description, priority, assigneeId, dueDate);
      const assignee = members.find((m) => m.id === assigneeId);
      setTasksList((prev) => [...prev, { ...task, assigneeName: assignee?.name ?? null }]);
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setDueDate("");
    } catch (err) {
      alert(toActionError(err).message);
    }
    setSubmitting(false);
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = tasksList.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const prev = tasksList;
    setTasksList((p) => p.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await updateTaskStatus(teamId, taskId, newStatus as "open" | "in_progress" | "done");
    } catch (err) {
      alert(toActionError(err).message);
      setTasksList(prev);
    }
  }

  const activeTask = tasksList.find((t) => t.id === activeId);

  return (
    <>
      <details className="bg-[#14141c] border border-[#26262f] rounded-xl p-6 mb-8">
        <summary className="text-white font-semibold cursor-pointer flex items-center gap-2">
          <Plus size={18} className="text-yellow-400" />
          New Task
        </summary>
        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3 mt-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="bg-[#0a0a0f] border border-[#26262f] text-white p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400">
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="col-span-2 bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="bg-[#0a0a0f] border border-[#26262f] text-white p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-[#0a0a0f] border border-[#26262f] text-white p-3 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
          <button type="submit" disabled={submitting} className="col-span-2 bg-yellow-400 text-black font-semibold px-5 py-2.5 rounded-lg text-sm disabled:opacity-50">
            {submitting ? "Creating..." : "Create Task"}
          </button>
        </form>
      </details>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <DroppableColumn key={col.key} col={col} items={tasksList.filter((t) => t.status === col.key)} />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="bg-[#14141c] border border-yellow-400 rounded-lg p-3 shadow-xl shadow-black/50 w-[300px]">
              <p className="text-sm font-medium text-white">{activeTask.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
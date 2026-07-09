"use client";

import { useState } from "react";
import { createTask, updateTaskStatus } from "@/app/actions/tasks";
import { toActionError } from "@/app/lib/action-error";
import { Plus, ClipboardList } from "lucide-react";

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
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-400",
  medium: "bg-yellow-500/10 text-yellow-400",
  high: "bg-red-500/10 text-red-400",
};

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  async function handleStatusChange(taskId: string, status: string) {
    const prev = tasksList;
    setTasksList((p) => p.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try {
      await updateTaskStatus(teamId, taskId, status as "open" | "in_progress" | "done");
    } catch (err) {
      alert(toActionError(err).message);
      setTasksList(prev);
    }
  }

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

      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.key}>
            <h3 className="text-sm font-medium text-gray-300 mb-3">{col.label}</h3>
            <div className="space-y-2">
              {tasksList.filter((t) => t.status === col.key).map((t) => (
                <div key={t.id} className="bg-[#14141c] border border-[#26262f] rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-white">{t.title}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                  </div>
                  {t.description && <p className="text-xs text-gray-500 mb-2">{t.description}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{t.assigneeName ?? "Unassigned"}</span>
                    {t.dueDate && <span>{new Date(t.dueDate).toLocaleDateString()}</span>}
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                    className="w-full mt-2 bg-[#0a0a0f] border border-[#26262f] text-gray-300 text-xs p-1.5 rounded"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              ))}
              {tasksList.filter((t) => t.status === col.key).length === 0 && (
                <div className="border border-dashed border-[#26262f] rounded-lg p-4 text-center text-xs text-gray-600">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
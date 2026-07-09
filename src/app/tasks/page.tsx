import { getActiveContext } from "@/app/actions/session-context";
import { getTeamTasks, getTeamMembersForAssign } from "@/app/actions/tasks";
import PageWrap from "@/app/components/PageWrap";
import TasksBoard from "@/app/components/TasksBoard";
import { ClipboardList } from "lucide-react";

export default async function TasksPage() {
  const active = await getActiveContext();
  if (!active.teamId) {
    return (
      <PageWrap>
        <div className="p-8 max-w-5xl mx-auto">
          <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-12 text-center">
            <p className="text-gray-400">Join a team first to access Tasks.</p>
          </div>
        </div>
      </PageWrap>
    );
  }

  const [tasksList, members] = await Promise.all([
    getTeamTasks(active.teamId),
    getTeamMembersForAssign(active.teamId),
  ]);

  return (
    <PageWrap>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-2">
          <ClipboardList size={22} className="text-yellow-400" />
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
        </div>
        <TasksBoard teamId={active.teamId} initialTasks={tasksList} members={members} />
      </div>
    </PageWrap>
  );
}
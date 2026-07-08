"use client";

import { useEffect, useState } from "react";
import { getNotificationsData, respondToRequest } from "@/app/actions/teams";
import { getUserTeamContext } from "@/app/actions/session-context";
import { toActionError } from "@/app/lib/action-error";
import AnimatedButton from "@/app/components/AnimatedButton";
import PageWrap from "@/app/components/PageWrap";
import { Bell, UserPlus } from "lucide-react";

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isFounder, setIsFounder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserTeamContext().then((ctx) => setIsFounder(ctx.isFounder));
    load();
  }, []);

  async function load() {
    const data = await getNotificationsData();
    setNotifs(data.notifs);
    setPendingRequests(data.pendingRequests);
    setLoading(false);
  }

  async function handleRespond(requestId: string, approve: boolean) {
    try {
      await respondToRequest(requestId, approve);
      load();
    } catch (e) {
      alert(toActionError(e).message);
    }
  }

  if (loading) return null;

  return (
    <PageWrap>
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Bell size={26} className="text-yellow-400" />
          Notifications
        </h1>
      </div>

      {isFounder && pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
            Pending Join Requests
          </h2>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#14141c] border border-yellow-400/30 rounded-xl p-5 flex items-center justify-between transition-all duration-200 hover:border-yellow-400/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-400/5"
              >
                <div className="flex items-center gap-3">
                  <UserPlus size={18} className="text-yellow-400" />
                  <span className="text-white">
                    {req.requesterName ?? "Someone"} wants to join your team
                  </span>
                </div>
                <div className="flex gap-2">
                  <AnimatedButton onClick={() => handleRespond(req.id, true)} className="bg-green-500/10 text-green-400 px-4 py-1.5 rounded-lg text-sm font-medium">
                    Approve
                  </AnimatedButton>
                  <AnimatedButton onClick={() => handleRespond(req.id, false)} className="bg-red-500/10 text-red-400 px-4 py-1.5 rounded-lg text-sm font-medium">
                    Deny
                  </AnimatedButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
        All Notifications
      </h2>
      {notifs.length === 0 ? (
        <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-12 text-center">
          <p className="text-gray-500">You're all caught up.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <div key={n.id} className="bg-[#14141c] border border-[#26262f] rounded-xl p-4 text-sm flex justify-between transition-all duration-200 hover:border-[#33333f] hover:translate-x-0.5">
              <span className="text-gray-300">
                {(() => {
                  let payload: any = {};
                  try { payload = JSON.parse(n.payload ?? "{}"); } catch {}
                  if (n.type === "approved") return `Approved to join ${payload.teamName ?? "team"}`;
                  if (n.type === "denied") return `Request denied for ${payload.teamName ?? "team"}`;
                  if (n.type === "join_request") return `${payload.requesterName ?? "Someone"} requested to join`;
                  return n.type.replace("_", " ");
                })()}
              </span>
              <span className="text-gray-600 text-xs">{new Date(n.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
    </PageWrap>
  );
}
"use client";

import { useState } from "react";
import { postAnnouncement, togglePin } from "@/app/actions/team-extras";
import { Megaphone, Pin } from "lucide-react";

export default function AnnouncementsCard({
  teamId,
  announcements,
  isFounder,
}: {
  teamId: string;
  announcements: any[];
  isFounder: boolean;
}) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const sorted = [...announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  async function handlePost() {
    if (!text.trim()) return;
    setPosting(true);
    await postAnnouncement(teamId, text, true);
    setText("");
    setPosting(false);
    window.location.reload();
  }

  return (
    <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-5">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
        <Megaphone size={16} className="text-yellow-400" />
        Announcements
      </h3>

      {isFounder && (
        <div className="mb-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Post an announcement..."
            className="flex-1 bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-2 rounded-lg text-sm focus:outline-none focus:border-yellow-400"
          />
          <button
            onClick={handlePost}
            disabled={posting}
            className="bg-yellow-400 text-black text-sm font-semibold px-3 rounded-lg disabled:opacity-50"
          >
            Post
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {sorted.length === 0 ? (
          <p className="text-gray-600 text-sm">No announcements yet.</p>
        ) : (
          sorted.map((a) => (
            <div key={a.id} className="bg-[#0a0a0f] border border-[#26262f] rounded-lg p-3 flex items-start gap-2">
              {a.pinned && <Pin size={12} className="text-yellow-400 mt-0.5 flex-shrink-0" />}
              <p className="text-sm text-gray-300">{a.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
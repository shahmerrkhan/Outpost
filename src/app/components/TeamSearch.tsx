"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function TeamSearch({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <div className="relative mb-4">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder="Search teams..."
        className="w-full bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 pl-9 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400"
      />
    </div>
  );
}
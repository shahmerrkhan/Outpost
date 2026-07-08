"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type Option = { key: string; label: string };

export default function CustomDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.key === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-[#1a1a24] border border-[#33333f] text-white text-xs rounded-md px-2 py-2 flex items-center justify-between hover:border-yellow-400/50 transition"
      >
        <span>{current?.label ?? "Select"}</span>
        <ChevronDown size={12} className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-[#1a1a24] border border-[#33333f] rounded-md overflow-hidden shadow-xl">
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              className={`w-full text-left text-xs px-3 py-2 transition ${
                opt.key === value
                  ? "bg-yellow-400/10 text-yellow-400"
                  : "text-gray-300 hover:bg-[#22222c]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getUnreadCount } from "@/app/actions/teams";
import { useSidebarVisible } from "./SidebarContext";

export default function TopBar() {
  const { isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();
  const { visible: sidebarVisible } = useSidebarVisible();
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function poll() {
      try {
        const c = await getUnreadCount();
        setCount(c);
      } catch {}
    }
    poll();
    const interval = setInterval(poll, 20000);
    return () => clearInterval(interval);
  }, []);

  if (!isLoaded || !isSignedIn) return null;
  if (pathname === "/") return null;
  if (pathname === "/onboarding") return null;
  if (pathname === "/launch") return null;

  return (
    <div
      className={`fixed top-0 right-0 z-40 flex items-center gap-4 p-4 transition-all duration-200 ${
        sidebarVisible ? "left-64" : "left-0"
      }`}
      style={{ justifyContent: "flex-end" }}
    >
      <Link
        href="/notifications"
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors duration-150"
      >
        <Bell size={18} className="text-gray-400" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5 leading-4 animate-pulse">
            {count}
          </span>
        )}
      </Link>
      <UserButton />
    </div>
  );
}
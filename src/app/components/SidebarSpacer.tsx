"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function SidebarSpacer({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const hasSidebar = isLoaded && isSignedIn && pathname !== "/onboarding" && pathname !== "/";

  return <div className={hasSidebar ? "ml-64 min-h-screen" : "min-h-screen"}>{children}</div>;
}
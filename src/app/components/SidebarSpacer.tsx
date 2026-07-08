"use client";

import { ReactNode } from "react";
import { useSidebarVisible } from "./SidebarContext";

export default function SidebarSpacer({ children }: { children: ReactNode }) {
  const { visible } = useSidebarVisible();
  return <div className={visible ? "ml-64 min-h-screen" : "min-h-screen"}>{children}</div>;
}
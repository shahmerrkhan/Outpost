"use client";
import { createContext, useContext, useState, ReactNode } from "react";

const Ctx = createContext<{ visible: boolean; setVisible: (v: boolean) => void }>({
  visible: false,
  setVisible: () => {},
});

export function SidebarVisibleProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return <Ctx.Provider value={{ visible, setVisible }}>{children}</Ctx.Provider>;
}

export function useSidebarVisible() {
  return useContext(Ctx);
}
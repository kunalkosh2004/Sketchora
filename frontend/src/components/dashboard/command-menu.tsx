"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, Plus, Search, SunMoon } from "lucide-react";
import { CommandMenu, type CommandItem } from "@/components/ui/command-menu";

export function DashboardCommandMenu({
  onNewDesign,
  onFocusSearch,
}: {
  onNewDesign: () => void;
  onFocusSearch: () => void;
}) {
  const router = useRouter();

  const commands = useMemo<CommandItem[]>(
    () => [
      {
        id: "new-design",
        label: "New design",
        hint: "Start from a sketch",
        icon: Plus,
        run: () => {
          onNewDesign();
        },
      },
      {
        id: "search",
        label: "Search projects",
        hint: "Jump to the search field",
        icon: Search,
        run: onFocusSearch,
      },
      {
        id: "studio",
        label: "Open studio",
        hint: "Design workspace",
        icon: Compass,
        run: () => router.push("/studio"),
      },
      {
        id: "theme",
        label: "Toggle appearance",
        hint: "Switch between light and dark",
        icon: SunMoon,
        run: () => {
          const dark = document.documentElement.classList.contains("dark");
          document.documentElement.classList.toggle("dark", !dark);
          try {
            localStorage.setItem("sketchora-theme", dark ? "light" : "dark");
          } catch {
            /* ignore */
          }
          window.dispatchEvent(new Event("sketchora:theme-change"));
        },
      },
      {
        id: "landing",
        label: "Go to landing page",
        icon: ArrowRight,
        run: () => router.push("/"),
      },
    ],
    [onNewDesign, onFocusSearch, router],
  );

  return <CommandMenu commands={commands} />;
}
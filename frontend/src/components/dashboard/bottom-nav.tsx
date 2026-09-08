"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Plus, Scissors, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Home", icon: Home, href: "/dashboard", match: ["/dashboard"] },
  { label: "Projects", icon: LayoutGrid, href: "/dashboard#projects", match: [] },
  { label: "Create", icon: Plus, action: "create" as const },
  { label: "Studio", icon: Scissors, href: "/studio", match: ["/studio"] },
  { label: "Profile", icon: User, action: "profile" as const },
];

export function BottomNav({
  onNewDesign,
  onOpenProfile,
}: {
  onNewDesign: () => void;
  onOpenProfile: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match?.includes(pathname) ?? false;
          const common = cn(
            "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors duration-200",
            active ? "text-ink" : "text-muted",
          );
          if ("action" in item) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={
                  item.action === "create" ? onNewDesign : onOpenProfile
                }
                className={common}
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full transition-colors duration-200",
                    item.action === "create" &&
                      "bg-ink text-paper shadow-soft",
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>
                {item.label}
              </button>
            );
          }
          return (
            <Link key={item.label} href={item.href} className={common}>
              <span className="grid size-8 place-items-center rounded-full">
                <Icon className="size-[18px]" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
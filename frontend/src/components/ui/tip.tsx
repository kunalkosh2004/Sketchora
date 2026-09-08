import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** CSS-only tooltip — show `label` on hover (pointer devices, lg+). */
export function Tip({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("group/tip relative", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-paper shadow-soft lg:group-hover/tip:block"
      >
        {label}
      </span>
    </span>
  );
}
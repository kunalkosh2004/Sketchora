import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Sketchora — home"
    >
      <span className="grid size-7 place-items-center rounded-lg bg-ink text-paper transition-transform duration-300 ease-out-soft group-hover:-rotate-3">
        <span className="font-display text-[17px] leading-none tracking-tight">
          S
        </span>
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
        Sketchora
      </span>
    </Link>
  );
}
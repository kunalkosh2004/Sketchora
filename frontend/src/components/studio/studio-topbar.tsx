"use client";

import { ArrowLeft, Download, Link2 } from "lucide-react";
import { Tip } from "@/components/ui/tip";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { projectStatusLabel } from "@/lib/projects";
import { cn } from "@/lib/utils";

type Status = "sketch" | "analyzing" | "rendering" | "failed" | "completed";

const STATUS_STYLE: Record<Status, string> = {
  sketch: "text-ink-soft",
  analyzing: "text-ink",
  rendering: "text-ink",
  failed: "text-accent",
  completed: "text-ink-soft",
};

export function StudioTopbar({
  projectName,
  status,
  onSave,
  onShare,
  onDownload,
}: {
  projectName: string;
  status: Status;
  onSave: () => void;
  onShare: () => void;
  onDownload: () => void;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-paper/85 px-4 backdrop-blur-xl md:px-6">
      <Tip label="Back to studio" className="shrink-0">
        <a
          href="/dashboard"
          aria-label="Back to studio"
          className="grid size-9 place-items-center rounded-md text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
        >
          <ArrowLeft className="size-[18px]" />
        </a>
      </Tip>

      <div className="h-5 w-px bg-line md:hidden" />

      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden font-display text-lg italic text-ink md:block">
          S
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-medium tracking-[-0.01em] text-ink">
            {projectName}
          </h1>
          <p
            className={cn(
              "font-mono text-[9.5px] uppercase tracking-[0.16em]",
              STATUS_STYLE[status],
            )}
          >
            {status === "analyzing"
              ? "Analyzing sketch…"
              : status === "rendering"
                ? "Rendering…"
                : projectStatusLabel[
                    status === "sketch" ? "sketched" : status === "failed" ? "failed" : "completed"
                  ]}
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Tip label="Download artwork">
          <button
            type="button"
            onClick={onDownload}
            aria-label="Download artwork"
            className="grid size-9 place-items-center rounded-md text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            <Download className="size-[18px]" />
          </button>
        </Tip>
        <ThemeToggle />
        <button
          type="button"
          onClick={onShare}
          className="hidden h-9 items-center gap-1.5 rounded-md border border-line-strong px-3.5 text-[13px] font-medium text-ink transition-colors duration-200 hover:bg-ink/[0.03] sm:inline-flex"
        >
          <Link2 className="size-3.5" />
          Share
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-4 text-[13px] font-medium text-paper transition-colors duration-200 hover:bg-ink/85"
        >
          Save
          <kbd className="hidden rounded border border-paper/25 px-1 py-px font-mono text-[9.5px] text-paper/70 md:inline">
            ⌘S
          </kbd>
        </button>
      </div>
    </header>
  );
}
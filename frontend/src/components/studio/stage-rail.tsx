"use client";

import { Clapperboard, LayoutGrid, PenTool, SlidersHorizontal, Sparkles } from "lucide-react";
import { Tip } from "@/components/ui/tip";
import { STAGES, type Stage } from "@/lib/studio";
import { cn } from "@/lib/utils";

const ICONS: Record<Stage, typeof PenTool> = {
  sketch: PenTool,
  spec: SlidersHorizontal,
  visualize: Sparkles,
  variations: LayoutGrid,
  animate: Clapperboard,
};

/** Desktop icon rail (lg+). */
export function StageRail({
  stage,
  onSelect,
}: {
  stage: Stage;
  onSelect: (s: Stage) => void;
}) {
  return (
    <nav
      aria-label="Workflow stages"
      className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-line bg-surface/60 py-4 lg:flex"
    >
      {STAGES.map((s) => {
        const Icon = ICONS[s.id];
        const active = s.id === stage;
        return (
          <Tip key={s.id} label={`${s.label} (${s.shortcut})`}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              aria-label={s.label}
              aria-current={active ? "step" : undefined}
              className={cn(
                "grid size-10 place-items-center rounded-lg transition-all duration-200",
                active
                  ? "bg-ink text-paper shadow-soft"
                  : "text-muted hover:bg-ink/[0.06] hover:text-ink",
              )}
            >
              <Icon className="size-[18px]" />
            </button>
          </Tip>
        );
      })}
      <div className="mt-auto pt-4">
        <span className="block h-px w-6 bg-line" aria-hidden="true" />
      </div>
    </nav>
  );
}

/** Horizontal segmented tabs (below lg). */
export function StageTabs({
  stage,
  onSelect,
}: {
  stage: Stage;
  onSelect: (s: Stage) => void;
}) {
  return (
    <nav
      aria-label="Workflow stages"
      className="flex gap-1 overflow-x-auto border-b border-line bg-paper/85 px-3 py-2 backdrop-blur-xl lg:hidden"
    >
      {STAGES.map((s) => {
        const Icon = ICONS[s.id];
        const active = s.id === stage;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors duration-200",
              active ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/[0.06]",
            )}
          >
            <Icon className="size-4" />
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}
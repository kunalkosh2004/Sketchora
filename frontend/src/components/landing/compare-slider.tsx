"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SketchIllustration } from "@/components/artwork/sketch";
import { VisualizationIllustration } from "@/components/artwork/visualization";

/**
 * Before/after comparison between the hand-drawn sketch and the AI
 * visualization. A full-size invisible range input drives the divider, so
 * drag, touch, and keyboard (arrow keys) all work natively and the control
 * is accessible as a slider.
 */
export function CompareSlider() {
  const [pos, setPos] = useState(50);
  const [interacted, setInteracted] = useState(false);
  const [focused, setFocused] = useState(false);
  const hinted = useRef(false);

  const markInteracted = useCallback(() => {
    if (!hinted.current) {
      hinted.current = true;
      setInteracted(true);
    }
  }, []);

  return (
    <div
      className="relative aspect-[4/5] w-full select-none overflow-hidden rounded-3xl border border-line bg-paper shadow-lift sm:rounded-4xl"
      onPointerDown={markInteracted}
    >
      {/* Visualization — base layer */}
      <VisualizationIllustration className="absolute inset-0 h-full w-full" />

      {/* Sketch — clipped to the left of the divider */}
      <div
        className="absolute inset-0 h-full w-full"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        aria-hidden="true"
      >
        <SketchIllustration detailed className="h-full w-full" />
      </div>

      {/* Divider + handle */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-paper/90 shadow-[0_0_0_1px_rgba(28,25,21,0.06)]" />
        <div
          className={[
            "absolute top-1/2 -ml-[22px] -mt-[22px] grid size-11 place-items-center rounded-full border border-line-strong bg-paper text-ink shadow-lift transition-shadow duration-200",
            focused && "ring-2 ring-accent ring-offset-2 ring-offset-paper",
          ].join(" ")}
        >
          <ChevronsLeftRight className="size-[18px] text-ink-soft" />
        </div>
      </div>

      {/* Labels */}
      <span className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-full border border-line bg-paper/75 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft backdrop-blur-md">
        Sketch
      </span>
      <span className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-full border border-line bg-paper/75 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft backdrop-blur-md">
        AI visualization
      </span>

      {/* Interaction hint */}
      <AnimatePresence>
        {!interacted && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -6,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-5 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-paper/80 px-4 py-2 text-xs font-medium text-ink-soft shadow-soft backdrop-blur-md"
          >
            Drag to compare
          </motion.span>
        )}
      </AnimatePresence>

      {/* Invisible slider overlay — the actual control */}
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        onPointerDown={markInteracted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Compare hand-drawn sketch and AI visualization"
        className="absolute inset-0 z-20 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
      />
    </div>
  );
}
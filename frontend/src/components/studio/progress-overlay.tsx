"use client";

import { motion } from "motion/react";
import { Check, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type StepState = "pending" | "active" | "done";

/** Full-bleed overlay over the canvas while analysis/generation runs. */
export function ProgressOverlay({
  title,
  steps,
  completeLabel,
}: {
  title: string;
  steps: { label: string; state: StepState }[];
  completeLabel?: string;
}) {
  const complete = steps.every((s) => s.state === "done");
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 bg-paper/60 px-6 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-5 text-center"
      >
        <span className="grid size-12 place-items-center rounded-2xl border border-line bg-surface text-ink shadow-soft">
          <motion.span
            animate={complete ? { rotate: 0 } : { rotate: 360 }}
            transition={
              complete
                ? { duration: 0.3 }
                : { duration: 2.4, repeat: Infinity, ease: "linear" }
            }
          >
            {complete ? <Check className="size-5" /> : <LoaderCircle className="size-5" />}
          </motion.span>
        </span>
        <div>
          <h3 className="font-display text-2xl italic text-ink md:text-3xl">
            {complete ? (completeLabel ?? "Done.") : title}
          </h3>
          {!complete && (
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              This takes a moment
            </p>
          )}
        </div>
      </motion.div>

      <ul className="w-full max-w-[300px] space-y-2.5">
        {steps.map((step) => (
          <li
            key={step.label}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-colors duration-300",
              step.state === "done" && "bg-surface/70",
              step.state === "active" && "bg-surface",
            )}
          >
            <span
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full border text-[9px] transition-colors duration-300",
                step.state === "done" && "border-accent bg-accent text-paper",
                step.state === "active" && "border-line-strong text-ink-soft",
                step.state === "pending" && "border-line text-muted",
              )}
            >
              {step.state === "done" ? (
                <Check className="size-3" />
              ) : (
                <span className="size-1 rounded-full bg-current" />
              )}
            </span>
            <span
              className={cn(
                "text-sm transition-colors duration-300",
                step.state === "pending" ? "text-muted" : "text-ink",
              )}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
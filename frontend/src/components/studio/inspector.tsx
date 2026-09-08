"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Clapperboard, FileText, Sparkles, X } from "lucide-react";
import { relativeTime, type Project } from "@/lib/projects";
import {
  COLORWAYS,
  GENERATION_STEPS,
  MOTIONS,
  SPEC_OPTIONS,
  type DesignSpec,
  type Stage,
  type Version,
} from "@/lib/studio";
import { cn } from "@/lib/utils";

function Field({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full cursor-pointer rounded-md border border-line bg-surface px-3 text-sm text-ink transition-colors duration-200 hover:border-line-strong focus:border-line-strong focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function SpecEditor({
  spec,
  onChange,
}: {
  spec: DesignSpec;
  onChange: (patch: Partial<DesignSpec>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Garment"
          value={spec.garment}
          options={SPEC_OPTIONS.garment}
          onChange={(v) => onChange({ garment: v })}
        />
        <Field
          label="Silhouette"
          value={spec.silhouette}
          options={SPEC_OPTIONS.silhouette}
          onChange={(v) => onChange({ silhouette: v })}
        />
        <Field
          label="Neckline"
          value={spec.neckline}
          options={SPEC_OPTIONS.neckline}
          onChange={(v) => onChange({ neckline: v })}
        />
        <Field
          label="Sleeve"
          value={spec.sleeve}
          options={SPEC_OPTIONS.sleeve}
          onChange={(v) => onChange({ sleeve: v })}
        />
        <Field
          label="Fabric"
          value={spec.fabric}
          options={SPEC_OPTIONS.fabric}
          onChange={(v) => onChange({ fabric: v })}
        />
        <Field
          label="Length"
          value={spec.length}
          options={SPEC_OPTIONS.length}
          onChange={(v) => onChange({ length: v })}
        />
      </div>

      <div>
        <span className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
          Colorway
        </span>
        <div className="flex flex-wrap gap-2">
          {COLORWAYS.map((c) => {
            const active = spec.colorway === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onChange({ colorway: c.name })}
                aria-label={`Colorway ${c.name}`}
                aria-pressed={active}
                className={cn(
                  "grid size-8 place-items-center rounded-full border transition-all duration-200",
                  active
                    ? "scale-110 border-ink ring-1 ring-ink ring-offset-2 ring-offset-paper"
                    : "border-line hover:scale-105",
                )}
                style={{ backgroundColor: c.hex }}
              >
                {active && <Check className="size-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
          Styling notes
        </span>
        <textarea
          value={spec.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
          placeholder="Drape notes, construction details, editorial direction…"
          className="w-full resize-none rounded-md border border-line bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-muted transition-colors duration-200 focus:border-line-strong focus:outline-none"
        />
      </label>
    </div>
  );
}

function VersionHistory({
  versions,
  currentId,
  onSelect,
}: {
  versions: Version[];
  currentId: string;
  onSelect: (v: Version) => void;
}) {
  return (
    <div className="border-t border-line pt-4">
      <p className="mb-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
        Version history
      </p>
      <ol>
        {versions.map((v, i) => {
          const active = v.id === currentId;
          return (
            <li key={v.id} className="relative flex gap-3 pb-3 last:pb-0">
              {i < versions.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[9px] top-4 h-full w-px bg-line-strong"
                />
              )}
              <button
                type="button"
                onClick={() => onSelect(v)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "z-10 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[9px]",
                  active
                    ? "border-accent bg-accent text-paper"
                    : "border-line-strong bg-surface text-ink-soft transition-colors hover:border-ink/50",
                )}
              >
                {v.id.replace("v", "V")}
              </button>
              <button
                type="button"
                onClick={() => onSelect(v)}
                className={cn(
                  "pt-0.5 text-[13px] transition-colors",
                  active ? "font-medium text-ink" : "text-ink-soft hover:text-ink",
                )}
              >
                {v.label}
                {active && (
                  <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
                    Current
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

export function InspectorContent({
  stage,
  project,
  analyzed,
  spec,
  onSpecChange,
  generated,
  generating,
  generationFailed,
  onGenerate,
  onRetry,
  variationsCount,
  onGenerateVariations,
  animateState,
  onAnimate,
  onMotionChange,
  onDurationChange,
  onExport,
  versions,
  currentVersionId,
  onSelectVersion,
  onOpenSpec,
  onAnalyze,
}: {
  stage: Stage;
  project: Project;
  analyzed: boolean;
  spec: DesignSpec;
  onSpecChange: (patch: Partial<DesignSpec>) => void;
  generated: boolean;
  generating: boolean;
  generationFailed: boolean;
  onGenerate: () => void;
  onRetry: () => void;
  variationsCount: number;
  onGenerateVariations: () => void;
  animateState: { generated: boolean; playing: boolean; motion: string; duration: number };
  onAnimate: () => void;
  onMotionChange: (m: string) => void;
  onDurationChange: (s: number) => void;
  onExport: (kind: "MP4" | "GIF") => void;
  versions: Version[];
  currentVersionId: string;
  onSelectVersion: (v: Version) => void;
  onOpenSpec: () => void;
  onAnalyze: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Stage-specific content */}
      {stage === "sketch" && (
        <Section>
          <div>
            <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
              About this sketch
            </p>
            <dl className="space-y-1.5 text-[13px]">
              {[
                ["Source", "Photographed paper sketch"],
                ["Uploaded", relativeTime(project.updatedAt)],
                ["Status", analyzed ? "Analyzed" : "Awaiting analysis"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          {!analyzed ? (
            <>
              <button
                type="button"
                onClick={onAnalyze}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-medium text-paper transition-all duration-200 hover:-translate-y-px hover:bg-ink/85"
              >
                <Sparkles className="size-4" />
                Analyze sketch
              </button>
              <p className="text-[12.5px] leading-relaxed text-muted">
                Sketchora reads silhouette, neckline, fabric, and construction,
                then drafts a specification you can refine.
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenSpec}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface text-sm font-medium text-ink transition-colors duration-200 hover:bg-ink/[0.04]"
              >
                <FileText className="size-4" />
                Open specification
              </button>
              <p className="text-[12.5px] leading-relaxed text-muted">
                The specification is ready — refine silhouette, fabric, and
                construction before generating.
              </p>
            </>
          )}
        </Section>
      )}

      {stage === "spec" && (
        <Section>
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
              Design specification
            </p>
            {analyzed && (
              <span className="inline-flex items-center gap-1 text-[11px] text-accent">
                <Check className="size-3" /> From your sketch
              </span>
            )}
          </div>
          <SpecEditor spec={spec} onChange={onSpecChange} />
        </Section>
      )}

      {stage === "visualize" && (
        <Section>
          <div>
            <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
              Generation
            </p>
            {generating ? (
              <p className="text-[13px] text-ink-soft">
                Rendering {GENERATION_STEPS.at(-1)?.toLowerCase()}…
              </p>
            ) : generated ? (
              <p className="text-[13px] text-ink-soft">
                Visualization ready — last generated{" "}
                {relativeTime(project.updatedAt)}.
              </p>
            ) : (
              <p className="text-[13px] leading-relaxed text-ink-soft">
                Turn the specification into a realistic garment render.
              </p>
            )}
          </div>
          {!generating && !generated && (
            <button
              type="button"
              onClick={onGenerate}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-medium text-paper shadow-soft transition-all duration-200 hover:-translate-y-px hover:bg-accent-deep"
            >
              <Sparkles className="size-4" />
              Generate visualization
            </button>
          )}
          {generationFailed && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface text-sm font-medium text-ink transition-colors duration-200 hover:bg-ink/[0.04]"
            >
              Retry generation
            </button>
          )}
          {generated && !generating && (
            <button
              type="button"
              onClick={onGenerate}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface text-sm font-medium text-ink transition-colors duration-200 hover:bg-ink/[0.04]"
            >
              Regenerate
            </button>
          )}
        </Section>
      )}

      {stage === "variations" && (
        <Section>
          <div>
            <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
              Variations
            </p>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              {variationsCount > 0
                ? `${variationsCount} directions from the current render. Select one to make it the canvas design.`
                : "Explore colorways, fabric swaps, and styling directions side by side."}
            </p>
          </div>
          <button
            type="button"
            onClick={onGenerateVariations}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-medium text-paper transition-all duration-200 hover:-translate-y-px hover:bg-ink/85"
          >
            <Sparkles className="size-4" />
            {variationsCount > 0 ? "Regenerate variations" : "Generate variations"}
          </button>
        </Section>
      )}

      {stage === "animate" && (
        <Section>
          <div>
            <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
              Animate design
            </p>
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] text-ink-soft">Motion</span>
              <div className="grid grid-cols-1 gap-1.5">
                {MOTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onMotionChange(m)}
                    aria-pressed={animateState.motion === m}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-[13px] transition-colors duration-150",
                      animateState.motion === m
                        ? "border-ink bg-ink/[0.05] font-medium text-ink"
                        : "border-line text-ink-soft hover:border-line-strong",
                    )}
                  >
                    <Clapperboard className="size-3.5" />
                    {m}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-[12.5px] text-ink-soft">
              <span>Duration</span>
              <span className="font-mono text-[11px] text-ink">{animateState.duration}s</span>
            </span>
            <input
              type="range"
              min={2}
              max={8}
              step={1}
              value={animateState.duration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              aria-label="Animation duration in seconds"
              className="w-full accent-ink"
            />
          </label>

          {!animateState.generated ? (
            <button
              type="button"
              onClick={onAnimate}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-medium text-paper transition-all duration-200 hover:-translate-y-px hover:bg-ink/85"
            >
              <Sparkles className="size-4" />
              Generate animation
            </button>
          ) : (
            <>
              <p className="text-[12.5px] leading-relaxed text-ink-soft">
                Preview is playing on the canvas. Export video or GIF when the
                media pipeline lands.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onExport("MP4")}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-line-strong bg-surface text-[13px] font-medium text-ink transition-colors duration-200 hover:bg-ink/[0.04]"
                >
                  Export MP4
                </button>
                <button
                  type="button"
                  onClick={() => onExport("GIF")}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-line-strong bg-surface text-[13px] font-medium text-ink transition-colors duration-200 hover:bg-ink/[0.04]"
                >
                  Export GIF
                </button>
              </div>
            </>
          )}
        </Section>
      )}

      <VersionHistory
        versions={versions}
        currentId={currentVersionId}
        onSelect={onSelectVersion}
      />
    </div>
  );
}

/** Mobile bottom sheet hosting the same inspector content. */
export function InspectorSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Inspector"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 max-h-[75dvh] overflow-y-auto rounded-t-3xl border-t border-line bg-paper shadow-overlay"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/90 px-5 py-3 backdrop-blur-md">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Inspector
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close inspector"
                className="grid size-9 place-items-center rounded-md text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
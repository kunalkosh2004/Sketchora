import type { ReactNode } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SketchIllustration } from "@/components/artwork/sketch";
import { VisualizationIllustration } from "@/components/artwork/visualization";
import { cn } from "@/lib/utils";

function FeatureRow({
  eyebrow,
  title,
  body,
  visual,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <Reveal className={cn(reverse && "md:order-2")}>
        <div>
          <p className="eyebrow text-accent">{eyebrow}</p>
          <h3 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.015em] text-ink md:text-[28px]">
            {title}
          </h3>
          <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-ink-soft">
            {body}
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.12} y={24}>
        {visual}
      </Reveal>
    </div>
  );
}

/* ---- Feature visuals ---------------------------------------------------- */

function AnalysisVisual() {
  const chips = [
    { top: "9%", left: "12%", label: "Silhouette — A-line" },
    { top: "22%", left: "68%", label: "Neckline — Sweetheart" },
    { top: "42%", left: "8%", label: "Fabric — Silk satin" },
    { top: "66%", left: "60%", label: "Drape — Flowing" },
  ];
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-paper shadow-soft">
      <SketchIllustration className="h-full w-full" />
      {chips.map((c) => (
        <span
          key={c.label}
          className="absolute rounded-full border border-line bg-paper/85 px-3 py-1.5 font-mono text-[10px] tracking-[0.08em] text-ink-soft shadow-soft backdrop-blur-md"
          style={{ top: c.top, left: c.left }}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}

function VariationsVisual() {
  const hues = [0, 95, 180, 265];
  return (
    <div className="grid grid-cols-2 gap-4">
      {hues.map((hue, i) => (
        <div
          key={hue}
          className="overflow-hidden rounded-2xl border border-line bg-paper shadow-soft transition-transform duration-300 ease-out-soft hover:-translate-y-1"
        >
          <VisualizationIllustration dressHue={hue} className="h-full w-full" />
          <div className="flex items-center justify-between border-t border-line px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Var {String(i + 1).padStart(2, "0")}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-ink/20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EditVisual() {
  return (
    <div className="rounded-3xl border border-line bg-paper p-6 shadow-soft md:p-8">
      <div className="rounded-2xl bg-ink p-6 text-paper shadow-lift">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">
          Edit in plain language
        </p>
        <p className="mt-4 font-display text-xl italic leading-relaxed text-paper md:text-2xl">
          “Make the sleeves sheer and add gold embroidery at the neckline.”
        </p>
        <div className="mt-6 flex items-center justify-between border-t border-paper/15 pt-5">
          <span className="flex items-center gap-2 text-sm text-paper/70">
            <Wand2 className="size-4" /> Applying to version 3
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-paper">
            <Sparkles className="size-4" /> Apply
          </span>
        </div>
      </div>
    </div>
  );
}

function MotionVisual() {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-paper shadow-soft">
      <VisualizationIllustration className="h-full w-full" />
      {/* gentle sheen sweep */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.18)_50%,transparent_60%)] bg-[length:250%_100%] motion-safe:animate-[sheen_4.5s_ease-in-out_infinite]"
      />
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/85 px-4 py-2 text-xs font-medium text-ink shadow-soft backdrop-blur-md">
          <span className="grid size-6 place-items-center rounded-full bg-accent text-paper">
            <svg viewBox="0 0 12 12" className="ml-0.5 size-2.5" fill="currentColor" aria-hidden="true">
              <path d="M2 1.5v9l8-4.5z" />
            </svg>
          </span>
          Slow turn · 4s
        </span>
      </div>
      <style>{`@keyframes sheen { 0%,100% { background-position: 200% 0 } 50% { background-position: -80% 0 } }`}</style>
    </div>
  );
}

function HistoryVisual() {
  const versions = [
    { v: "V1", label: "Original sketch", current: false },
    { v: "V2", label: "Fabric: silk", current: false },
    { v: "V3", label: "Neckline refined", current: false },
    { v: "V4", label: "Current", current: true },
  ];
  return (
    <div className="rounded-3xl border border-line bg-paper p-6 shadow-soft md:p-8">
      <p className="eyebrow text-muted">Version history</p>
      <ol className="mt-6 space-y-0">
        {versions.map((ver, i) => (
          <li key={ver.v} className="relative flex gap-4 pb-5 last:pb-0">
            {i < versions.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-[13px] top-7 h-full w-px bg-line-strong"
              />
            )}
            <span
              className={cn(
                "z-10 mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border font-mono text-[10px]",
                ver.current
                  ? "border-accent bg-accent text-paper"
                  : "border-line-strong bg-paper text-ink-soft",
              )}
            >
              {ver.v}
            </span>
            <div className="pt-1">
              <p
                className={cn(
                  "text-sm",
                  ver.current
                    ? "font-medium text-ink"
                    : "text-ink-soft",
                )}
              >
                {ver.label}
                {ver.current && (
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                    Current
                  </span>
                )}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---- Section ------------------------------------------------------------ */

const FEATURES = [
  {
    eyebrow: "Sketch analysis",
    title: "Reads like a designer, not a scanner.",
    body: "Upload any hand-drawn sketch — loose pencil, ballpoint, even a napkin doodle. Sketchora identifies silhouette, neckline, fabric, and construction, then drafts a structured specification you can refine.",
    visual: <AnalysisVisual />,
  },
  {
    eyebrow: "Visualization",
    title: "From line to light, fabric, and form.",
    body: "The specification becomes a realistic garment render — with drape, texture, and proportion — so you see the design as it will actually move and fall.",
    visual: (
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-paper shadow-soft">
        <VisualizationIllustration className="h-full w-full" />
      </div>
    ),
    reverse: true,
  },
  {
    eyebrow: "Variations",
    title: "One idea, many directions.",
    body: "Explore colorways, fabric swaps, and styling choices side by side. Every variation is a new branch you can take further — nothing is overwritten.",
    visual: <VariationsVisual />,
  },
  {
    eyebrow: "Editing",
    title: "Change it in plain language.",
    body: "Tell the design what to change, and the garment updates in place — version by version, so you always know where a design came from.",
    visual: <EditVisual />,
    reverse: true,
  },
  {
    eyebrow: "Animation",
    title: "From stills to motion.",
    body: "Set the garment in motion — slow turns, fabric movement, editorial walks — and export video or GIF for lookbooks, decks, and campaigns.",
    visual: <MotionVisual />,
  },
  {
    eyebrow: "History",
    title: "Every version, kept.",
    body: "Designs evolve in branches, not destructive saves. Revisit, compare, or roll back to any point in a garment's journey.",
    visual: <HistoryVisual />,
    reverse: true,
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <p className="eyebrow text-accent">Capabilities</p>
            <h2 className="mt-5 font-display text-4xl leading-[1.08] tracking-[-0.01em] text-ink md:text-5xl">
              Designed for the way
              <br />
              designers think.
            </h2>
          </div>
        </Reveal>

        <div className="mt-20 space-y-20 md:mt-28 md:space-y-28">
          {FEATURES.map((f) => (
            <FeatureRow key={f.eyebrow} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
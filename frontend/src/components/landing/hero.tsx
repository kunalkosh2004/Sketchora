import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { CompareSlider } from "@/components/landing/compare-slider";

const PROCESS = [
  "Sketch",
  "Analyze",
  "Visualize",
  "Vary",
  "Edit",
  "Animate",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 md:pt-40">
      {/* Soft ambient wash behind the headline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(125,51,40,0.05),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="eyebrow text-muted">
              Sketchora&ensp;·&ensp;AI fashion design
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 font-display text-[clamp(3rem,9vw,6.25rem)] leading-[1.02] tracking-[-0.02em] text-ink">
              From sketch,
              <br />
              <em className="italic text-ink-soft">to reality</em>
              <span className="not-italic text-accent">.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mx-auto mt-7 max-w-xl text-balance text-[17px] leading-relaxed text-ink-soft">
              Sketchora turns hand-drawn fashion sketches into realistic
              visual concepts — then variations, edits, and motion. The way
              you sketch, understood by AI.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/studio" size="lg" className="w-full sm:w-auto">
                Start designing
              </ButtonLink>
              <ButtonLink
                href="#how-it-works"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                See how it works
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        {/* The transformation */}
        <Reveal delay={0.2} y={32} className="mt-16 md:mt-20">
          <div className="mx-auto max-w-[620px]">
            <CompareSlider />
            <div className="mt-4 flex items-center justify-between px-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                01 — Hand-drawn sketch
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                02 — AI visualization
              </span>
            </div>
          </div>
        </Reveal>

        {/* Process strip */}
        <Reveal delay={0.1} className="mt-14 md:mt-16">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-line pt-8">
            {PROCESS.map((step, i) => (
              <span
                key={step}
                className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted"
              >
                {step}
                {i < PROCESS.length - 1 && (
                  <span aria-hidden="true" className="text-line-strong">
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
import { Reveal } from "@/components/ui/reveal";

const LANGUAGE = [
  "Silhouette",
  "Neckline",
  "Drape",
  "Construction",
  "Fabric",
  "Texture",
  "Proportion",
  "Styling",
  "Collection",
];

const FLOW = ["Sketch", "Analyze", "Visualize", "Vary", "Edit", "Animate", "Share"];

export function Workflow() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <div className="rounded-4xl bg-ink px-6 py-16 text-paper shadow-lift md:px-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow text-paper/50">The workflow</p>
              <h2 className="mt-6 font-display text-4xl leading-[1.08] tracking-[-0.01em] md:text-[52px]">
                Built for the way
                <br />
                <em className="italic text-paper/80">designers actually work.</em>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-balance text-[15.5px] leading-relaxed text-paper/70">
                From the first pencil line to the final runway render,
                Sketchora stays out of your way — and keeps your artwork
                front and center.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                {LANGUAGE.map((word) => (
                  <span
                    key={word}
                    className="rounded-full border border-paper/20 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.08em] text-paper/70 transition-colors duration-200 hover:border-paper/50 hover:text-paper"
                  >
                    {word}
                  </span>
                ))}
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-paper/15 pt-9">
                {FLOW.map((step, i) => (
                  <span
                    key={step}
                    className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-paper/60"
                  >
                    {step}
                    {i < FLOW.length - 1 && (
                      <span aria-hidden="true" className="text-paper/30">
                        →
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
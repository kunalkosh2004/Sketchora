import { Reveal } from "@/components/ui/reveal";
import { SketchIllustration } from "@/components/artwork/sketch";
import { VisualizationIllustration } from "@/components/artwork/visualization";

const STEPS = [
  {
    n: "01",
    title: "Sketch",
    body: "Draw a garment on paper, the way you already work. Photograph the sketch — any angle, any level of detail.",
    art: <SketchIllustration detailed={false} className="h-full w-full" />,
  },
  {
    n: "02",
    title: "Visualize",
    body: "Sketchora reads the silhouette, neckline, fabric, and construction — then renders a realistic visual concept of the garment.",
    art: <VisualizationIllustration className="h-full w-full" />,
  },
  {
    n: "03",
    title: "Create",
    body: "Refine the specification, explore variations, edit in plain language, and bring the design to life in motion.",
    art: (
      <div className="grid h-full w-full grid-cols-2 gap-2 p-4">
        {[0, 95, 180, 265].map((hue, i) => (
          <div
            key={hue}
            className="overflow-hidden rounded-xl border border-line"
          >
            <VisualizationIllustration dressHue={hue} className="h-full w-full" />
            <span className="sr-only">Variation {i + 1}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <p className="eyebrow text-accent">How it works</p>
            <h2 className="mt-5 font-display text-4xl leading-[1.08] tracking-[-0.01em] text-ink md:text-5xl">
              From paper to picture,
              <br />
              in three steps.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.1}>
              <article className="group">
                <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-paper shadow-soft transition-transform duration-300 ease-out-soft group-hover:-translate-y-1">
                  {step.art}
                </div>
                <div className="mt-6 border-t border-line pt-5">
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-lg italic text-accent">
                      {step.n}
                    </span>
                    <h3 className="text-lg font-semibold tracking-[-0.01em] text-ink">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                    {step.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
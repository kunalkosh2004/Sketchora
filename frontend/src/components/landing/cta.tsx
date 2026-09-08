import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="pb-24 pt-8 md:pb-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.05] tracking-[-0.015em] text-ink">
              Your next collection
              <br />
              starts with a sketch.
            </h2>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/dashboard" size="lg" className="w-full sm:w-auto">
                Start designing
              </ButtonLink>
              <ButtonLink
                href="#how-it-works"
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto"
              >
                Revisit how it works
              </ButtonLink>
            </div>
            <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Free to explore — the design workspace arrives next
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
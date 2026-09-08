import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProjectCard } from "@/components/dashboard/project-card";
import { seedProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Studio — Sketchora",
  description: "Open a design in the Sketchora workspace.",
};

export default function Studio() {
  return (
    <main className="min-h-dvh">
      <header className="border-b border-line bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              aria-label="Back to studio"
              className="grid size-9 place-items-center rounded-md text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
            >
              <ArrowLeft className="size-[18px]" />
            </a>
            <span className="h-5 w-px bg-line" aria-hidden="true" />
            <Logo />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
        <h1 className="font-display text-4xl tracking-[-0.015em] text-ink md:text-5xl">
          Choose a design.
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Open a project to work through the sketch-to-visualization flow.
        </p>

        <div id="studio-cards" className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {seedProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
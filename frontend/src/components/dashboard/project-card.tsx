import { ArrowUpRight } from "lucide-react";
import { SketchIllustration } from "@/components/artwork/sketch";
import { VisualizationIllustration } from "@/components/artwork/visualization";
import {
  projectStatusLabel,
  relativeTime,
  type Project,
} from "@/lib/projects";
import { cn } from "@/lib/utils";

function ProjectArtwork({ project }: { project: Project }) {
  if (project.visual.kind === "sketch") {
    return <SketchIllustration detailed={false} className="h-full w-full" />;
  }
  return (
    <VisualizationIllustration
      dressHue={project.visual.hue}
      backdrop={project.visual.backdrop}
      className="h-full w-full"
    />
  );
}

function MetaLine({ project }: { project: Project }) {
  const parts =
    project.status === "sketched"
      ? ["Sketch", relativeTime(project.updatedAt)]
      : [`${project.generations} generations`, relativeTime(project.updatedAt)];
  return (
    <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
      {parts.join("  ·  ")}
    </p>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href="/studio"
      className="group block overflow-hidden rounded-xl border border-line bg-surface shadow-soft transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-lift"
      aria-label={`${project.name} — ${projectStatusLabel[project.status]}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <div className="h-full w-full transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]">
          <ProjectArtwork project={project} />
        </div>

        {/* Status chip */}
        {project.status !== "completed" && (
          <span
            className={cn(
              "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/85 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] backdrop-blur-md",
              project.status === "generating" && "text-ink",
              project.status === "sketched" && "text-ink-soft",
              project.status === "failed" && "text-accent",
            )}
          >
            {project.status === "generating" && (
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-accent motion-safe:animate-pulse"
              />
            )}
            {projectStatusLabel[project.status]}
          </span>
        )}

        {/* Hover affordance (desktop) */}
        <span className="pointer-events-none absolute bottom-3 right-3 grid size-9 translate-y-1 place-items-center rounded-full border border-line bg-paper/85 text-ink opacity-0 shadow-soft backdrop-blur-md transition-all duration-300 ease-out-soft group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className="px-4 py-3.5">
        <h3 className="truncate text-[15px] font-medium tracking-[-0.01em] text-ink">
          {project.name}
        </h3>
        <div className="mt-1.5">
          <MetaLine project={project} />
        </div>
      </div>
    </a>
  );
}
import { FolderOpen } from "lucide-react";
import { motion } from "motion/react";
import { ProjectCard } from "@/components/dashboard/project-card";
import type { Project } from "@/lib/projects";

export function ProjectsGrid({
  projects,
  loading,
  query,
  onClearSearch,
}: {
  projects: Project[];
  loading: boolean;
  query: string;
  onClearSearch: () => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft"
          >
            <div className="aspect-[4/5] bg-ink/[0.05] motion-safe:animate-pulse" />
            <div className="px-4 py-3.5">
              <div className="h-3.5 w-3/4 rounded bg-ink/[0.07] motion-safe:animate-pulse" />
              <div className="mt-2.5 h-2.5 w-1/2 rounded bg-ink/[0.05] motion-safe:animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-20 text-center md:py-24"
      >
        <div className="grid size-12 place-items-center rounded-2xl bg-ink/[0.05] text-ink-soft">
          <FolderOpen className="size-5" />
        </div>
        {query ? (
          <>
            <h3 className="mt-5 font-display text-2xl italic text-ink">
              Nothing matches “{query}”.
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              Try a different name, or clear the search to see your whole
              studio.
            </p>
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-6 rounded-md border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-ink/[0.04]"
            >
              Clear search
            </button>
          </>
        ) : (
          <>
            <h3 className="mt-5 font-display text-2xl italic text-ink">
              Your studio is waiting.
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              Start with a sketch and turn your first idea into reality.
            </p>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {projects.map((project, i) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: Math.min(i * 0.05, 0.4),
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </div>
  );
}
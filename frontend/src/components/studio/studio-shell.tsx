"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig } from "motion/react";
import { ArrowLeft, LayoutGrid, Link2, Save, Sparkles, SlidersHorizontal, SunMoon } from "lucide-react";
import type { Project } from "@/lib/projects";
import {
  ANALYSIS_STEPS,
  DEFAULT_SPEC,
  GENERATED_HUE,
  GENERATION_STEPS,
  STAGES,
  deriveVariations,
  deriveVersions,
  type DesignSpec,
  type ProgressSteps,
  type Stage,
  type Variation,
  type Version,
} from "@/lib/studio";
import { StudioTopbar } from "@/components/studio/studio-topbar";
import { StageRail, StageTabs } from "@/components/studio/stage-rail";
import { StudioCanvas, type StudioCanvasHandle } from "@/components/studio/studio-canvas";
import { InspectorContent, InspectorSheet } from "@/components/studio/inspector";
import { Toast } from "@/components/studio/toast";
import { CommandMenu, type CommandItem } from "@/components/ui/command-menu";

const STEP_MS = 820;

function buildSteps(labels: string[]): ProgressSteps {
  return labels.map((label, i) => ({
    label,
    state: i === 0 ? ("active" as const) : ("pending" as const),
  }));
}

function advanceSteps(prev: ProgressSteps, doneCount: number): ProgressSteps {
  return prev.map((s, j) => ({
    ...s,
    state: j < doneCount ? "done" : j === doneCount ? "active" : "pending",
  }));
}

export function StudioShell({ project }: { project: Project }) {
  const hasRender = project.visual.kind === "render";

  const [stage, setStage] = useState<Stage>(hasRender ? "visualize" : "sketch");
  const [analyzed, setAnalyzed] = useState(!(project.status === "sketched"));
  const [spec, setSpec] = useState<DesignSpec>(DEFAULT_SPEC);
  const [analysisSteps, setAnalysisSteps] = useState<ProgressSteps | null>(null);

  const [versions, setVersions] = useState<Version[]>(() => deriveVersions(project));
  const [currentVersionId, setCurrentVersionId] = useState<string>(
    () => deriveVersions(project).find((v) => v.current)!.id,
  );

  const [generated, setGenerated] = useState(hasRender);
  const [generating, setGenerating] = useState(project.status === "generating");
  const [generationSteps, setGenerationSteps] = useState<ProgressSteps | null>(null);
  const [generationFailed, setGenerationFailed] = useState(project.status === "failed");
  const baseHue =
    project.visual.kind === "render" ? project.visual.hue : GENERATED_HUE;

  const [variations, setVariations] = useState<Variation[]>(() =>
    project.visual.kind === "render" ? deriveVariations(project.visual.hue) : [],
  );
  const [activeVariationId, setActiveVariationId] = useState<string | null>(null);

  const [animateState, setAnimateState] = useState({
    motion: "Slow turn",
    duration: 4,
    generated: false,
    playing: false,
  });

  const [toast, setToast] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const canvasRef = useRef<StudioCanvasHandle>(null);

  // Demo transitions are driven by timers here until the backend phases land.
  // Each one is a pure UI state change — no fake data is persisted.

  const runAnalysis = useCallback(() => {
    setAnalysisSteps(buildSteps(ANALYSIS_STEPS));
    ANALYSIS_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setAnalysisSteps((prev) => (prev ? advanceSteps(prev, i + 1) : prev));
      }, STEP_MS * (i + 1));
    });
    setTimeout(() => {
      setAnalysisSteps(null);
      setAnalyzed(true);
      setToast("Analysis complete — the specification is ready.");
    }, STEP_MS * (ANALYSIS_STEPS.length + 1));
  }, []);

  const runGeneration = useCallback(() => {
    setGenerationFailed(false);
    setGenerating(true);
    setGenerationSteps(buildSteps(GENERATION_STEPS));
    GENERATION_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setGenerationSteps((prev) => (prev ? advanceSteps(prev, i + 1) : prev));
      }, STEP_MS * (i + 1));
    });
    setTimeout(() => {
      setGenerating(false);
      setGenerationSteps(null);
      setGenerated(true);
      setVersions((prev) =>
        prev.some((v) => v.id === "v2")
          ? prev
          : [
              ...prev.map((v) => ({ ...v, current: false })),
              { id: "v2", label: "First visualization", hue: GENERATED_HUE, current: true },
            ],
      );
      setCurrentVersionId("v2");
      setVariations(deriveVariations(GENERATED_HUE));
      setToast("Your design is ready.");
    }, STEP_MS * (GENERATION_STEPS.length + 1));
  }, []);

  // Projects mid-generation (seed status) finish after a beat.
  useEffect(() => {
    if (project.status !== "generating") return;
    const t = setTimeout(runGeneration, 900);
    return () => clearTimeout(t);
  }, [project.status, runGeneration]);

  // Toast auto-dismiss.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const save = useCallback(() => {
    setToast("Saved locally — sync arrives with the backend.");
  }, []);

  const share = useCallback(() => {
    try {
      void navigator.clipboard?.writeText(window.location.href);
    } catch {
      /* clipboard unavailable */
    }
    setToast("Link copied.");
  }, []);

  // ⌘S to save, number keys to switch stages.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      } else if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const n = Number(e.key);
        if (n >= 1 && n <= STAGES.length) setStage(STAGES[n - 1].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  const currentVersion = useMemo(
    () => versions.find((v) => v.id === currentVersionId) ?? versions[0],
    [versions, currentVersionId],
  );

  const handleUseVariation = useCallback((v: Variation) => {
    setActiveVariationId((prev) => (prev === v.id ? null : v.id));
  }, []);

  const handleSelectVersion = useCallback((v: Version) => {
    setCurrentVersionId(v.id);
    setActiveVariationId(null);
  }, []);

  const handleGenerateVariations = useCallback(() => {
    setVariations(deriveVariations(baseHue));
    setToast("6 variations ready.");
  }, [baseHue]);

  const handleAnimate = useCallback(() => {
    setAnimateState((s) => ({ ...s, generated: true, playing: true }));
    setToast("Your animation is ready.");
  }, []);

  const handleExport = useCallback((kind: "MP4" | "GIF") => {
    setToast(`${kind} export arrives with the media pipeline.`);
  }, []);

  const status: "sketch" | "analyzing" | "rendering" | "failed" | "completed" =
    analysisSteps
      ? "analyzing"
      : generating || generationSteps
        ? "rendering"
        : generationFailed
          ? "failed"
          : !generated
            ? "sketch"
            : "completed";

  const router = useRouter();

  const commands = useMemo<CommandItem[]>(
    () => [
      {
        id: "save",
        label: "Save design",
        hint: "⌘S",
        icon: Save,
        run: save,
      },
      ...(!generated && !generating
        ? [
            {
              id: "generate",
              label: "Generate visualization",
              icon: Sparkles,
              run: runGeneration,
            },
          ]
        : []),
      {
        id: "variations",
        label: "Open variations",
        icon: LayoutGrid,
        run: () => setStage("variations"),
      },
      {
        id: "share",
        label: "Share design",
        icon: Link2,
        run: share,
      },
      {
        id: "theme",
        label: "Toggle appearance",
        icon: SunMoon,
        run: () => {
          const dark = document.documentElement.classList.contains("dark");
          document.documentElement.classList.toggle("dark", !dark);
          try {
            localStorage.setItem("sketchora-theme", dark ? "light" : "dark");
          } catch {
            /* ignore */
          }
          window.dispatchEvent(new Event("sketchora:theme-change"));
        },
      },
      {
        id: "dashboard",
        label: "Go to dashboard",
        icon: ArrowLeft,
        run: () => router.push("/dashboard"),
      },
    ],
    [save, generated, generating, runGeneration, share, router],
  );

  const inspector = (
    <InspectorContent
      stage={stage}
      project={project}
      analyzed={analyzed}
      spec={spec}
      onSpecChange={(patch) => setSpec((s) => ({ ...s, ...patch }))}
      generated={generated}
      generating={generating}
      generationFailed={generationFailed}
      onGenerate={runGeneration}
      onRetry={runGeneration}
      variationsCount={variations.length}
      onGenerateVariations={handleGenerateVariations}
      animateState={animateState}
      onAnimate={handleAnimate}
      onMotionChange={(m) => setAnimateState((s) => ({ ...s, motion: m }))}
      onDurationChange={(d) => setAnimateState((s) => ({ ...s, duration: d }))}
      onExport={handleExport}
      versions={versions}
      currentVersionId={currentVersionId}
      onSelectVersion={handleSelectVersion}
      onOpenSpec={() => setStage("spec")}
      onAnalyze={runAnalysis}
    />
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-dvh flex-col bg-paper text-ink">
        <StudioTopbar
          projectName={project.name}
          status={status}
          onSave={save}
          onShare={share}
          onDownload={() => canvasRef.current?.download()}
        />

        <div className="flex min-h-0 flex-1">
          <StageRail stage={stage} onSelect={setStage} />

          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
            <StageTabs stage={stage} onSelect={setStage} />

            <div className="relative h-[55dvh] shrink-0 md:h-[60dvh] lg:h-auto lg:min-h-0 lg:flex-1">
              <StudioCanvas
                ref={canvasRef}
                stage={stage}
                project={project}
                renderHue={baseHue}
                currentVersion={currentVersion}
                analyzed={analyzed}
                analysisSteps={analysisSteps}
                onAnalyze={runAnalysis}
                onOpenSpec={() => setStage("spec")}
                generated={generated}
                generationSteps={generationSteps}
                generationFailed={generationFailed}
                onGenerate={runGeneration}
                onRetry={runGeneration}
                variations={variations}
                activeVariationId={activeVariationId}
                onUseVariation={handleUseVariation}
                compareOpen={compareOpen}
                onToggleCompare={() => setCompareOpen((v) => !v)}
                animateState={animateState}
                onTogglePlay={() =>
                  setAnimateState((s) => ({ ...s, playing: !s.playing }))
                }
                onAnimate={handleAnimate}
              />

              {/* Mobile inspector trigger */}
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="absolute bottom-4 right-4 z-30 inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface/95 px-4 text-[13px] font-medium text-ink shadow-lift backdrop-blur-md transition-transform duration-200 hover:-translate-y-px md:hidden"
              >
                <SlidersHorizontal className="size-4" />
                Details
              </button>
            </div>

            <div className="hidden border-t border-line md:block lg:w-[320px] lg:shrink-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
              {inspector}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {sheetOpen && (
            <InspectorSheet open onClose={() => setSheetOpen(false)}>
              {inspector}
            </InspectorSheet>
          )}
        </AnimatePresence>

        <Toast message={toast} />
        <CommandMenu commands={commands} />
      </div>
    </MotionConfig>
  );
}
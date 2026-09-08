"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";
import {
  Check,
  ChevronsLeftRight,
  Copy,
  Expand,
  Minimize2,
  Minus,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import { SketchIllustration } from "@/components/artwork/sketch";
import { VisualizationIllustration } from "@/components/artwork/visualization";
import { Tip } from "@/components/ui/tip";
import { ProgressOverlay } from "@/components/studio/progress-overlay";
import { downloadSvg } from "@/lib/svg";
import type { Backdrop, Project } from "@/lib/projects";
import type { ProgressSteps, Stage, Variation, Version } from "@/lib/studio";
import { cn } from "@/lib/utils";

export type StudioCanvasHandle = { download: () => void };

type Steps = ProgressSteps;

type ViewerProps = {
  children: React.ReactNode;
  zoom: number;
  onZoom: (z: number) => void;
  onFit: () => void;
  compare: boolean;
  onToggleCompare: () => void;
  filename: string;
  onDownload: () => void;
};

/** Floating viewer chrome: zoom, fit, compare, fullscreen, download. */
function Viewer({
  children,
  zoom,
  onZoom,
  onFit,
  compare,
  onToggleCompare,
  filename,
  onDownload,
}: ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement != null);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current?.requestFullscreen?.();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="group/viewer relative flex h-full w-full items-center justify-center overflow-hidden bg-ink/[0.025]"
    >
      {children}

      {/* Controls — hidden on hover (desktop), always visible on touch */}
      <div className="absolute right-3 top-3 z-30 flex items-center gap-1 rounded-xl border border-line bg-surface/90 p-1 shadow-soft backdrop-blur-md md:opacity-0 md:transition-opacity md:duration-300 md:group-hover/viewer:opacity-100">
        <Tip label={compare ? "Hide sketch comparison" : "Compare with sketch"}>
          <button
            type="button"
            onClick={onToggleCompare}
            aria-label="Compare with sketch"
            aria-pressed={compare}
            className={cn(
              "grid size-8 place-items-center rounded-lg transition-colors",
              compare ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/[0.06]",
            )}
          >
            <ChevronsLeftRight className="size-4" />
          </button>
        </Tip>
        <span className="h-4 w-px bg-line" aria-hidden="true" />
        <Tip label="Zoom out">
          <button
            type="button"
            onClick={() => onZoom(zoom - 0.25)}
            aria-label="Zoom out"
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            <Minus className="size-4" />
          </button>
        </Tip>
        <button
          type="button"
          onClick={onFit}
          aria-label="Zoom to fit"
          className="w-12 text-center font-mono text-[10.5px] text-ink-soft"
        >
          {Math.round(zoom * 100)}%
        </button>
        <Tip label="Zoom in">
          <button
            type="button"
            onClick={() => onZoom(zoom + 0.25)}
            aria-label="Zoom in"
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            <Plus className="size-4" />
          </button>
        </Tip>
        <span className="h-4 w-px bg-line" aria-hidden="true" />
        <Tip label="Download artwork">
          <button
            type="button"
            onClick={onDownload}
            aria-label="Download artwork"
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            <Copy className="size-4" />
          </button>
        </Tip>
        <Tip label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            {fullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Expand className="size-4" />
            )}
          </button>
        </Tip>
      </div>
      <span className="sr-only">{filename}</span>
    </div>
  );
}

/** Sketch-over-render comparison with a draggable divider. */
function CompareView({
  hue,
  backdrop,
}: {
  hue: number;
  backdrop: Backdrop;
}) {
  const [pos, setPos] = useState(50);
  return (
    <div className="absolute inset-0 z-10">
      <VisualizationIllustration
        dressHue={hue}
        backdrop={backdrop}
        className="h-full w-full"
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        aria-hidden="true"
      >
        <SketchIllustration detailed className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-paper/90" />
        <span className="absolute top-1/2 -ml-[18px] -mt-[18px] grid size-9 place-items-center rounded-full border border-line-strong bg-paper text-ink shadow-lift">
          <ChevronsLeftRight className="size-4 text-ink-soft" />
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare sketch and visualization"
        className="absolute inset-0 z-20 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
      />
    </div>
  );
}

type Props = {
  stage: Stage;
  project: Project;
  renderHue: number;
  currentVersion: Version;
  analyzed: boolean;
  analysisSteps: Steps | null;
  onAnalyze: () => void;
  onOpenSpec: () => void;
  generated: boolean;
  generationSteps: Steps | null;
  generationFailed: boolean;
  onGenerate: () => void;
  onRetry: () => void;
  variations: Variation[];
  activeVariationId: string | null;
  onUseVariation: (v: Variation) => void;
  compareOpen: boolean;
  onToggleCompare: () => void;
  animateState: { generated: boolean; playing: boolean; motion: string; duration: number };
  onTogglePlay: () => void;
  onAnimate: () => void;
};

const StudioCanvas = forwardRef<StudioCanvasHandle, Props>(function StudioCanvas(
  {
    stage,
    project,
    renderHue,
    currentVersion,
    analyzed,
    analysisSteps,
    onAnalyze,
    onOpenSpec,
  generated,
  generationSteps,
  generationFailed,
  onGenerate,
  onRetry,
    variations,
    activeVariationId,
    onUseVariation,
    compareOpen,
    onToggleCompare,
    animateState,
    onTogglePlay,
    onAnimate,
  },
  ref,
) {
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useImperativeHandle(ref, () => ({
    download: () => {
      if (svgRef.current) {
        downloadSvg(svgRef.current, `${project.name.toLowerCase().replace(/\s+/g, "-")}.svg`);
      }
    },
  }));

  const setSvgRef = (node: SVGSVGElement | null) => {
    svgRef.current = node;
  };

  const backdrop: Backdrop =
    project.visual.kind === "render" ? project.visual.backdrop : "warm";
  const hue = activeVariationId
    ? variations.find((v) => v.id === activeVariationId)?.hue ?? renderHue
    : renderHue;

  const filename = `${project.name.toLowerCase().replace(/\s+/g, "-")}.svg`;
  const onFit = () => setZoom(1);

  const renderArtwork =
    stage === "sketch" || stage === "spec" || currentVersion.hue === null ? (
      <SketchIllustration detailed={stage === "sketch"} className="h-full w-full" />
    ) : (
      <VisualizationIllustration
        ref={setSvgRef}
        dressHue={hue}
        backdrop={backdrop}
        className="h-full w-full"
      />
    );

  return (
    <Viewer
      zoom={zoom}
      onZoom={(z) => setZoom(Math.min(3, Math.max(0.5, z)))}
      onFit={onFit}
      compare={compareOpen}
      onToggleCompare={onToggleCompare}
      filename={filename}
      onDownload={() => svgRef.current && downloadSvg(svgRef.current, filename)}
    >
      <motion.div
        animate={{ scale: zoom }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-full w-full"
      >
        {renderArtwork}
      </motion.div>

      {/* Stage-specific overlays */}
      {stage === "sketch" && analysisSteps && (
        <ProgressOverlay title="Analyzing your sketch" steps={analysisSteps} completeLabel="Analysis complete." />
      )}

      {stage === "sketch" && !analysisSteps && (
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
          {analyzed ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-4 py-2 text-sm font-medium text-ink shadow-soft backdrop-blur-md">
              <Check className="size-4 text-accent" />
              Analysis complete
              <button
                type="button"
                onClick={onOpenSpec}
                className="ml-1 rounded-full bg-ink px-3 py-1 text-[12.5px] text-paper transition-colors hover:bg-ink/85"
              >
                Open specification
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={onAnalyze}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-6 text-sm font-medium text-paper shadow-lift transition-all duration-200 hover:-translate-y-px hover:bg-ink/85"
            >
              <Sparkles className="size-4" />
              Analyze sketch
            </button>
          )}
        </div>
      )}

      {stage === "visualize" && generationSteps && (
        <ProgressOverlay title="Creating your design" steps={generationSteps} completeLabel="Your design is ready." />
      )}

      {stage === "visualize" && !generationSteps && generationFailed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-paper/60 px-6 text-center backdrop-blur-md">
          <h3 className="font-display text-2xl italic text-ink md:text-3xl">
            Something went wrong.
          </h3>
          <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
            Your design is safe. We couldn&apos;t finish this generation.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line-strong bg-surface px-5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-ink/[0.04]"
          >
            <Target className="size-4" />
            Try again
          </button>
        </div>
      )}

      {stage === "visualize" && !generationSteps && !generationFailed && !generated && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-paper/45 px-6 text-center backdrop-blur-[2px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            From specification
          </p>
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-accent px-7 text-[15px] font-medium text-paper shadow-lift transition-all duration-200 hover:-translate-y-px hover:bg-accent-deep"
          >
            <Sparkles className="size-[18px]" />
            Generate visualization
          </button>
        </div>
      )}

      {stage === "variations" && variations.length > 0 && (
        <div className="absolute inset-0 z-10 overflow-y-auto bg-paper/40 p-4 backdrop-blur-[2px] md:p-6">
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {variations.map((v, i) => (
              <motion.button
                key={v.id}
                type="button"
                onClick={() => onUseVariation(v)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-surface text-left shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
                  v.id === activeVariationId ? "border-ink ring-1 ring-ink" : "border-line",
                )}
                aria-label={`${v.label} — use this`}
              >
                <div className="aspect-[4/5]">
                  <VisualizationIllustration
                    dressHue={v.hue}
                    backdrop={backdrop}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-line px-3 py-2">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
                    {v.label}
                  </span>
                  {v.id === activeVariationId && (
                    <Check className="size-3.5 text-accent" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {stage === "variations" && variations.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-paper/45 px-6 text-center backdrop-blur-[2px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Variations
          </p>
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-6 text-sm font-medium text-paper shadow-lift transition-all duration-200 hover:-translate-y-px hover:bg-ink/85"
          >
            <Sparkles className="size-4" />
            Generate variations
          </button>
        </div>
      )}

      {stage === "animate" && !animateState.generated && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-paper/45 px-6 text-center backdrop-blur-[2px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Still to motion
          </p>
          <button
            type="button"
            onClick={onAnimate}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-6 text-sm font-medium text-paper shadow-lift transition-all duration-200 hover:-translate-y-px hover:bg-ink/85"
          >
            <Sparkles className="size-4" />
            Animate design
          </button>
        </div>
      )}

      {stage === "animate" && animateState.generated && (
        <div className="absolute inset-0 z-10 overflow-hidden">
          <motion.div
            className="h-full w-full"
            animate={
              animateState.playing
                ? { scale: [1, 1.12], x: ["0%", "-2.5%"] }
                : { scale: 1, x: "0%" }
            }
            transition={{
              duration: animateState.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {renderArtwork}
          </motion.div>
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={animateState.playing ? "Pause preview" : "Play preview"}
            className="absolute bottom-4 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-surface/90 px-4 py-2 text-[13px] font-medium text-ink shadow-soft backdrop-blur-md"
          >
            <span className="grid size-6 place-items-center rounded-full bg-ink text-paper">
              {animateState.playing ? (
                <span className="block h-2.5 w-[3px] bg-paper" aria-hidden="true" />
              ) : (
                <svg viewBox="0 0 12 12" className="ml-0.5 size-2.5" fill="currentColor" aria-hidden="true">
                  <path d="M2 1.5v9l8-4.5z" />
                </svg>
              )}
            </span>
            {animateState.motion} · {animateState.duration}s
          </button>
        </div>
      )}

      {stage === "visualize" && compareOpen && currentVersion.hue !== null && (
        <CompareView hue={hue} backdrop={backdrop} />
      )}
    </Viewer>
  );
});

export { StudioCanvas };
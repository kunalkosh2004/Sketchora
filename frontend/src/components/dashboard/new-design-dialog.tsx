"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

type Draft = { name: string; url: string; size: number };

function validate(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) {
    return "That file isn’t supported — use JPG, PNG, or WEBP.";
  }
  if (file.size > MAX_BYTES) {
    return "That image is larger than 10 MB — try a lighter scan.";
  }
  return null;
}

/**
 * Rendered only while open (parent wraps it in AnimatePresence), so all
 * internal state resets naturally on close.
 */
export function NewDesignDialog({ onClose }: { onClose: () => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Revoke object URLs when the draft changes or the dialog unmounts.
  useEffect(() => {
    return () => {
      if (draft) URL.revokeObjectURL(draft.url);
    };
  }, [draft]);

  const acceptFile = useCallback((file: File) => {
    const problem = validate(file);
    if (problem) {
      setError(problem);
      setDraft(null);
      return;
    }
    setError(null);
    setDraft({ name: file.name, url: URL.createObjectURL(file), size: file.size });
  }, []);

  const clearDraft = useCallback(() => {
    setDraft((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4 backdrop-blur-sm md:p-8"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="New design"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-paper shadow-overlay"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
              New design
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Start with your sketch — JPG, PNG, or WEBP, up to 10 MB.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-md text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) acceptFile(file);
              e.target.value = "";
            }}
          />

          {draft ? (
            /* Selected sketch — preview + ready state */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative mx-auto aspect-[4/5] max-h-[46vh] overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.url}
                  alt="Your uploaded sketch"
                  className="h-full w-full object-contain"
                />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/85 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink backdrop-blur-md">
                  <Check className="size-3 text-accent" /> Ready
                </span>
                <button
                  type="button"
                  onClick={clearDraft}
                  aria-label="Choose a different sketch"
                  className="absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-line bg-paper/85 text-ink-soft backdrop-blur-md transition-colors hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="mt-3 truncate text-center text-[13px] text-ink-soft">
                {draft.name}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
                  Sketch selected
                </p>
                <ButtonLink href="/studio" onClick={onClose} className="w-auto">
                  Continue to studio
                  <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </motion.div>
          ) : (
            /* Dropzone */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) acceptFile(file);
                }}
                className={cn(
                  "group flex aspect-[4/5] max-h-[46vh] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed transition-all duration-300",
                  dragOver
                    ? "border-accent bg-accent-soft/60"
                    : "border-line-strong bg-surface hover:border-ink/40 hover:bg-ink/[0.02]",
                )}
              >
                <span
                  className={cn(
                    "grid size-14 place-items-center rounded-2xl transition-all duration-300",
                    dragOver
                      ? "scale-110 bg-accent text-paper"
                      : "bg-ink/[0.05] text-ink-soft group-hover:scale-105 group-hover:text-ink",
                  )}
                >
                  <ImagePlus className="size-6" />
                </span>
                <span className="px-8 text-center">
                  <span className="block text-[15px] font-medium text-ink">
                    Drop your sketch here
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">
                    or choose from your device
                  </span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  JPG · PNG · WEBP
                </span>
              </button>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="mt-3 text-center text-[13px] text-accent"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
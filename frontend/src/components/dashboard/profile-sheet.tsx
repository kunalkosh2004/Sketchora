"use client";

import { motion } from "motion/react";
import { X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AvatarButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open profile"
      className="grid size-9 place-items-center rounded-full bg-ink text-paper text-[13px] font-medium transition-transform duration-200 hover:scale-105"
    >
      K
    </button>
  );
}

/** Rendered only while open (parent wraps it in AnimatePresence). */
export function ProfileSheet({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 grid items-end bg-ink/30 backdrop-blur-sm md:place-items-center md:p-8"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Profile"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full rounded-t-3xl border border-line bg-paper shadow-overlay md:mx-auto md:max-w-sm md:rounded-3xl"
      >
        <div className="flex items-center justify-between px-6 py-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Profile
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-md text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-ink text-paper text-lg font-medium">
              K
            </span>
            <div>
              <p className="text-[15px] font-medium text-ink">Kunal</p>
              <p className="text-[13px] text-ink-soft">
                Fashion designer — demo account
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-1 border-t border-line pt-4">
            <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
              <span className="text-sm text-ink-soft">Appearance</span>
              <ThemeToggle />
            </div>
          </div>

          <p className="mt-4 rounded-lg bg-ink/[0.04] px-3.5 py-3 text-[13px] leading-relaxed text-ink-soft">
            Accounts and sign-in arrive with the authentication phase of the
            backend.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
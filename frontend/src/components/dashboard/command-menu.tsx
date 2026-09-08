"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Compass,
  Plus,
  Search,
  SunMoon,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CommandItem = {
  id: string;
  label: string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  run: () => void;
};

export function CommandMenu({
  onNewDesign,
  onFocusSearch,
}: {
  onNewDesign: () => void;
  onFocusSearch: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(false);

  // Keep a ref in sync so the (once-registered) global key handler always
  // sees the latest open state without re-subscribing.
  useEffect(() => {
    openRef.current = open;
    if (open) inputRef.current?.focus();
  }, [open]);

  // Global ⌘K / Ctrl+K toggle + Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const next = !openRef.current;
        setOpen(next);
        if (next) {
          setQuery("");
          setIndex(0);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commands = useMemo<CommandItem[]>(
    () => [
      {
        id: "new-design",
        label: "New design",
        hint: "Start from a sketch",
        icon: Plus,
        run: () => {
          setOpen(false);
          onNewDesign();
        },
      },
      {
        id: "search",
        label: "Search projects",
        hint: "Jump to the search field",
        icon: Search,
        run: () => {
          setOpen(false);
          onFocusSearch();
        },
      },
      {
        id: "studio",
        label: "Open studio",
        hint: "Design workspace",
        icon: Compass,
        run: () => {
          setOpen(false);
          router.push("/studio");
        },
      },
      {
        id: "theme",
        label: "Toggle appearance",
        hint: "Switch between light and dark",
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
        id: "landing",
        label: "Go to landing page",
        icon: ArrowRight,
        run: () => {
          setOpen(false);
          router.push("/");
        },
      },
    ],
    [onNewDesign, onFocusSearch, router],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        (c.hint ?? "").toLowerCase().includes(q),
    );
  }, [commands, query]);

  // Clamp the selection into range as the result list changes (no state write).
  const active = Math.min(index, results.length - 1);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-ink/30 p-4 backdrop-blur-sm"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-[12vh] w-full max-w-md overflow-hidden rounded-2xl border border-line bg-paper shadow-overlay"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Command className="size-4 shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setIndex((i) => Math.min(i + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter" && results[active]) {
                    results[active].run();
                  }
                }}
                placeholder="Type a command or search…"
                aria-label="Command menu input"
                className="h-13 w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
              />
              <kbd className="shrink-0 rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">
                Esc
              </kbd>
            </div>

            <div className="max-h-[40vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted">
                  No commands match “{query}”.
                </p>
              ) : (
                results.map((cmd, i) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => cmd.run()}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-100",
                        i === active
                          ? "bg-ink/[0.06] text-ink"
                          : "text-ink-soft",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.hint && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                          {cmd.hint}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
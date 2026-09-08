"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ProjectsGrid } from "@/components/dashboard/projects-grid";
import { NewDesignDialog } from "@/components/dashboard/new-design-dialog";
import { ProfileSheet } from "@/components/dashboard/profile-sheet";
import { CommandMenu } from "@/components/dashboard/command-menu";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { SearchInput, type SearchHandle } from "@/components/dashboard/search-input";
import { filterProjects, seedProjects } from "@/lib/projects";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Demo states — reachable via ?state=empty / ?state=loading so the empty and
 * loading experiences can be reviewed before the API exists. Remove when the
 * real data layer lands.
 */
function demoState(): "normal" | "empty" | "loading" {
  if (typeof window === "undefined") return "normal";
  const s = new URLSearchParams(window.location.search).get("state");
  return s === "empty" || s === "loading" ? s : "normal";
}

export function DashboardShell() {
  const [projects, setProjects] = useState(seedProjects);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [newDesignOpen, setNewDesignOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<SearchHandle>(null);

  // Simulate an initial fetch (~700ms) — swap for a real API call later.
  // The empty state resolves on the next tick so the initial skeleton paint
  // stays consistent between server and client.
  useEffect(() => {
    const state = demoState();
    if (state === "empty") {
      const t = setTimeout(() => {
        setProjects([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(t);
    }
    if (state === "loading") return; // stay on skeletons
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
  }, []);

  const visible = useMemo(
    () => filterProjects(projects, query),
    [projects, query],
  );

  // Fixed locale so the server and client render identical markup.
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh pb-24 md:pb-0">
        <DashboardNav
          query={query}
          onQueryChange={setQuery}
          searchRef={searchRef}
          onOpenProfile={() => setProfileOpen(true)}
        />

        <main className="mx-auto max-w-[1200px] px-5 pt-24 md:px-8 md:pt-28">
          {/* Heading */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-muted">{dateLabel}</p>
              <h1 className="mt-2 font-display text-4xl tracking-[-0.015em] text-ink md:text-5xl">
                {greeting()}.
              </h1>
              <p className="mt-2 text-[15px] text-ink-soft">Your studio</p>
            </div>
            <Button
              onClick={() => setNewDesignOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="size-4" />
              New design
            </Button>
          </div>

          {/* Mobile search */}
          <div className="mt-6 sm:hidden">
            <SearchInput value={query} onChange={setQuery} hint={false} />
          </div>

          {/* Projects */}
          <section id="projects" className="scroll-mt-24 pt-10 md:pt-12">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-medium text-ink-soft">
                {loading
                  ? "Loading your studio…"
                  : `${visible.length} ${visible.length === 1 ? "design" : "designs"}`}
              </h2>
              {!loading && visible.length > 0 && (
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
                  {query ? `Filtered by “${query}”` : "Newest first"}
                </p>
              )}
            </div>
            <ProjectsGrid
              projects={visible}
              loading={loading}
              query={query}
              onClearSearch={() => setQuery("")}
            />
          </section>
        </main>

        <AnimatePresence>
          {newDesignOpen && (
            <NewDesignDialog onClose={() => setNewDesignOpen(false)} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {profileOpen && (
            <ProfileSheet onClose={() => setProfileOpen(false)} />
          )}
        </AnimatePresence>
        <CommandMenu
          onNewDesign={() => setNewDesignOpen(true)}
          onFocusSearch={focusSearch}
        />
        <BottomNav
          onNewDesign={() => setNewDesignOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
        />
      </div>
    </MotionConfig>
  );
}
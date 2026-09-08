"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function Studio() {
  return (
    <main className="min-h-dvh">
      <DashboardNav
        query=""
        onQueryChange={() => {}}
        onOpenProfile={() => {}}
      />
      <section className="flex min-h-[80dvh] items-center justify-center px-5 pt-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink text-paper shadow-soft">
            <span className="font-display text-3xl">S</span>
          </div>
          <h1 className="mt-8 font-display text-4xl tracking-[-0.01em] text-ink">
            The workspace is next.
          </h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-soft">
            Your dashboard is live. Next we&apos;re building the design
            workspace — sketch analysis, specifications, and visualization —
            which will live here.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Back to your studio
          </Link>
        </div>
      </section>
    </main>
  );
}
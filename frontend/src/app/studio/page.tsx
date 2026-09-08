import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";

export default function Studio() {
  return (
    <main className="min-h-dvh">
      <Nav />
      <section className="flex min-h-[80dvh] items-center justify-center px-5 pt-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink text-paper shadow-soft">
            <span className="font-display text-3xl">S</span>
          </div>
          <h1 className="mt-8 font-display text-4xl tracking-[-0.01em] text-ink">
            The studio is next.
          </h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-soft">
            We&apos;re building the landing page first, then the dashboard, then
            the design workspace. Your sketch-to-reality workflow will live
            here.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Back to the landing page
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
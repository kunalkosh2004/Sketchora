import { Logo } from "@/components/ui/logo";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            From paper sketches to visual reality.
          </p>
        </div>
        <nav className="flex gap-7">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 py-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <span>© 2026 Sketchora</span>
          <span>AI fashion design visualization</span>
        </div>
      </div>
    </footer>
  );
}
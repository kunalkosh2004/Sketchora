"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchInput, type SearchHandle } from "@/components/dashboard/search-input";
import { AvatarButton } from "@/components/dashboard/profile-sheet";

const LINKS = [
  { href: "/dashboard", label: "Projects" },
  { href: "/studio", label: "Studio" },
];

export function DashboardNav({
  query,
  onQueryChange,
  searchRef,
  onOpenProfile,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  searchRef?: React.RefObject<SearchHandle | null>;
  onOpenProfile: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-paper/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5 md:px-8">
        <Logo />
        <div className="ml-2 hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors duration-200",
                link.href === "/dashboard"
                  ? "font-medium text-ink"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <SearchInput
            ref={searchRef}
            value={query}
            onChange={onQueryChange}
            className="hidden w-64 sm:block lg:w-72"
          />
          <ThemeToggle />
          <AvatarButton onClick={onOpenProfile} />
        </div>
      </nav>
    </header>
  );
}
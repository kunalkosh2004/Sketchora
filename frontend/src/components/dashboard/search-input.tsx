"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Show the ⌘K hint chip (desktop only). */
  hint?: boolean;
};

export type SearchHandle = { focus: () => void };

export const SearchInput = forwardRef<SearchHandle, Props>(
  ({ value, onChange, className, hint = true }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    return (
      <div className={cn("relative", className)}>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          aria-label="Search projects"
          placeholder="Search projects…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-md border border-line bg-surface pl-10 pr-16 text-sm text-ink placeholder:text-muted transition-colors duration-200 focus:border-line-strong focus:outline-none focus-visible:ring-0"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          hint && (
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] text-muted md:flex"
            >
              ⌘K
            </kbd>
          )
        )}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
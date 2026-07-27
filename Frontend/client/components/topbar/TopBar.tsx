"use client";

import { Code2, BookOpen, Sun, Search } from "lucide-react";

export default function TopBar({
  title,
  subtitle,
  online,
}: {
  title: string;
  subtitle: string;
  online?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 px-4 py-4 backdrop-blur md:px-6 md:py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-border/70 bg-card/70 px-3 py-2 text-sm text-muted-foreground md:flex">
            <Search className="size-4" />
            <span>Search</span>
            <kbd className="ml-2 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          </div>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card/60 text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
            aria-label="Source"
          >
            <Code2 className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card/60 text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
            aria-label="Docs"
          >
            <BookOpen className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card/60 text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
            aria-label="Theme"
          >
            <Sun className="size-4" />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs font-medium shadow-sm">
            <span
              className={`size-2.5 rounded-full ${online ? "bg-emerald-500" : "bg-red-500"}`}
            />
            {online ? "Server Running" : "Offline"}
          </div>
        </div>
      </div>
    </header>
  );
}

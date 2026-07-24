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
    <header className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground md:flex">
          <Search className="size-4" />
          <span>Search</span>
          <kbd className="ml-2 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px]">
            ⌘K
          </kbd>
        </div>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:text-foreground"
          aria-label="Source"
        >
          <Code2 className="size-4" />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:text-foreground"
          aria-label="Docs"
        >
          <BookOpen className="size-4" />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:text-foreground"
          aria-label="Theme"
        >
          <Sun className="size-4" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
          <span
            className={`size-2 rounded-full ${
              online ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          {online ? "Server Running" : "Offline"}
        </div>
      </div>
    </header>
  );
}

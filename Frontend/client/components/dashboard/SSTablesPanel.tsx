"use client";

import { Layers, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { SSTablesView } from "@/lib/normalize";

export default function SSTablesPanel({
  sstables,
  isLoading,
}: {
  sstables: SSTablesView;
  isLoading: boolean;
}) {
  const levels = sstables.levels ?? {};
  const levelKeys = Object.keys(levels)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Layers className="size-4" />
        </span>
        SSTables Overview
      </div>

      <div className="mt-5 flex-1 space-y-4">
        {isLoading && levelKeys.length === 0 && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}
        {!isLoading && levelKeys.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No SSTables reported yet.
          </p>
        )}
        {levelKeys.map((lvl) => {
          const files = levels[lvl];
          return (
            <div
              key={lvl}
              className="rounded-xl border border-border/70 bg-background/40 p-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Level {lvl}</span>
                <span className="text-xs text-muted-foreground">
                  {files.length} {files.length === 1 ? "file" : "files"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {files.map((f, idx) => (
                  <span
                    key={`${f.name ?? idx}`}
                    className="rounded-lg border border-border/70 bg-secondary/70 px-2.5 py-1 font-mono text-xs text-foreground"
                  >
                    {f.name ?? `sstable_${idx}`}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/sstables"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-border/70 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
      >
        View All SSTables
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

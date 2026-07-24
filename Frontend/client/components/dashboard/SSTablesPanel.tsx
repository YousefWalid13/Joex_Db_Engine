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
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Layers className="size-4 text-primary" />
        SSTables Overview
      </div>

      <div className="mt-4 flex-1 space-y-4">
        {isLoading && levelKeys.length === 0 && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}
        {!isLoading && levelKeys.length === 0 && (
          <p className="text-sm text-muted-foreground">No SSTables reported yet.</p>
        )}
        {levelKeys.map((lvl) => {
          const files = levels[lvl];
          return (
            <div key={lvl}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Level {lvl}</span>
                <span className="text-xs text-muted-foreground">
                  {files.length} {files.length === 1 ? "file" : "files"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {files.map((f, idx) => (
                  <span
                    key={`${f.name ?? idx}`}
                    className="rounded-lg border border-border bg-secondary px-2.5 py-1 font-mono text-xs"
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
        className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        View All SSTables
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

"use client";

import { Database, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { flushEngine } from "@/lib/api";
import { formatBytes, formatNumber } from "@/lib/format";
import type { MemTableView } from "@/lib/normalize";

export default function MemTablePanel({
  memtable,
  isLoading,
}: {
  memtable: MemTableView;
  isLoading: boolean;
}) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const max =
    memtable.maxBytes ??
    (memtable.sizeBytes ? memtable.sizeBytes * 2 : undefined);
  const percent =
    memtable.sizeBytes !== undefined && max
      ? Math.min(100, (memtable.sizeBytes / max) * 100)
      : undefined;

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dash = percent !== undefined ? (percent / 100) * circumference : 0;

  async function handleFlush() {
    setPending(true);
    try {
      await flushEngine();
      await queryClient.invalidateQueries({ queryKey: ["engine-memtable"] });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm transition-all duration-200">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Database className="size-4" />
        </span>
        MemTable
      </div>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-3 text-sm">
          <div className="rounded-xl border border-border/70 bg-background/40 p-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Current Size
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {isLoading ? "…" : formatBytes(memtable.sizeBytes)}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/40 p-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Records
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {isLoading ? "…" : formatNumber(memtable.recordCount)}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/40 p-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Flush Threshold
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {percent !== undefined ? `${percent.toFixed(0)}%` : "—"}
            </p>
          </div>
        </div>

        <div className="relative flex size-28 shrink-0 items-center justify-center self-center rounded-full bg-background/60">
          <svg width={112} height={112} className="-rotate-90">
            <circle
              cx={56}
              cy={56}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={10}
            />
            <circle
              cx={56}
              cy={56}
              r={radius}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={10}
              strokeDasharray={`${dash} ${circumference}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-lg font-semibold text-foreground">
            {percent !== undefined ? `${percent.toFixed(0)}%` : "—"}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleFlush}
        disabled={pending}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Flush Now
      </button>
    </div>
  );
}

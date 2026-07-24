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

  const max = memtable.maxBytes ?? (memtable.sizeBytes ? memtable.sizeBytes * 2 : undefined);
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
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Database className="size-4 text-primary" />
        MemTable
      </div>

      <div className="mt-4 flex items-center gap-6">
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Current Size</p>
            <p className="text-lg font-semibold">
              {isLoading ? "…" : formatBytes(memtable.sizeBytes)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Records</p>
            <p className="text-lg font-semibold">
              {isLoading ? "…" : formatNumber(memtable.recordCount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Flush Threshold</p>
            <p className="text-lg font-semibold">
              {percent !== undefined ? `${percent.toFixed(0)}%` : "—"}
            </p>
          </div>
        </div>

        <div className="relative flex size-28 shrink-0 items-center justify-center">
          <svg width={112} height={112} className="-rotate-90">
            <circle
              cx={56}
              cy={56}
              r={radius}
              fill="none"
              stroke="var(--secondary)"
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
          <span className="absolute text-lg font-semibold">
            {percent !== undefined ? `${percent.toFixed(0)}%` : "—"}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleFlush}
        disabled={pending}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Flush Now
      </button>
    </div>
  );
}

"use client";

import { RefreshCw, Loader2 } from "lucide-react";
import type { SSTablesView } from "@/lib/normalize";

function LevelRow({
  label,
  count,
  cap,
  highlight,
}: {
  label: string;
  count: number;
  cap: number;
  highlight?: boolean;
}) {
  const boxes = Array.from({ length: cap }, (_, i) => i < count);
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-sm font-medium">{label}</span>
      <div className="flex flex-1 flex-wrap gap-1.5">
        {boxes.map((filled, i) => (
          <span
            key={i}
            className={`size-6 rounded-md border ${
              filled
                ? highlight
                  ? "border-primary bg-primary/70"
                  : "border-primary bg-primary"
                : "border-border bg-secondary"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function CompactionPanel({
  sstables,
  activeCompactions,
}: {
  sstables: SSTablesView;
  activeCompactions?: number;
}) {
  const l0 = sstables.levels?.[0]?.length ?? 0;
  const l1 = sstables.levels?.[1]?.length ?? 0;
  const running = (activeCompactions ?? 0) > 0;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <RefreshCw className="size-4" />
        </span>
        Compaction
      </div>

      <div className="mt-5 flex-1 space-y-3 rounded-xl border border-border/70 bg-background/40 p-4">
        <LevelRow label="Level 0" count={l0} cap={Math.max(8, l0)} />

        <div className="flex justify-center py-1">
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
              running
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {running && <Loader2 className="size-3 animate-spin" />}
            {running
              ? "Compaction Running…"
              : `${activeCompactions ?? 0} active compactions`}
          </div>
        </div>

        <LevelRow label="Level 1" count={l1} cap={Math.max(6, l1)} highlight />
      </div>
    </div>
  );
}

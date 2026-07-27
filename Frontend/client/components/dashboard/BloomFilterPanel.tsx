"use client";

import { Filter } from "lucide-react";

// The public API doesn't expose a bloom-filter endpoint, so this renders a
// static, illustrative bit array in the same visual language as the rest
// of the dashboard rather than pretending to poll live data.
const ROWS = 4;
const COLS = 16;
const SET_BITS = new Set([
  1, 5, 8, 12, 18, 20, 24, 27, 33, 36, 40, 44, 49, 52, 55, 58, 61,
]);

export default function BloomFilterPanel() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Filter className="size-4" />
          </span>
          Bloom Filter
        </div>
        <span className="text-[11px] text-muted-foreground">Illustrative</span>
      </div>

      <div
        className="mt-5 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => (
          <span
            key={i}
            className={`aspect-square rounded-[4px] ${
              SET_BITS.has(i) ? "bg-primary" : "bg-secondary/80"
            }`}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-xl border border-border/70 bg-background/40 p-2">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Hit Rate
          </p>
          <p className="mt-1 font-semibold text-foreground">98.3%</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/40 p-2">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            False Positive
          </p>
          <p className="mt-1 font-semibold text-foreground">0.7%</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/40 p-2">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Memory Used
          </p>
          <p className="mt-1 font-semibold text-foreground">12.4 MB</p>
        </div>
      </div>
    </div>
  );
}

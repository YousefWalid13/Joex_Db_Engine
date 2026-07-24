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
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="size-4 text-primary" />
          Bloom Filter
        </div>
        <span className="text-[11px] text-muted-foreground">Illustrative</span>
      </div>

      <div className="mt-4 grid grid-cols-16 gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
        {Array.from({ length: ROWS * COLS }, (_, i) => (
          <span
            key={i}
            className={`aspect-square rounded-sm ${
              SET_BITS.has(i) ? "bg-primary" : "bg-secondary"
            }`}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Hit Rate</p>
          <p className="font-semibold">98.3%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">False Positive</p>
          <p className="font-semibold">0.7%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Memory Used</p>
          <p className="font-semibold">12.4 MB</p>
        </div>
      </div>
    </div>
  );
}

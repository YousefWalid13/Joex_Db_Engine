"use client";

import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { WALEntry } from "@/lib/normalize";
import { formatTime } from "@/lib/format";

const opColor: Record<string, string> = {
  PUT: "text-emerald-400",
  DELETE: "text-red-400",
  FLUSH: "text-primary",
  GET: "text-sky-400",
};

export default function WALPanel({
  entries,
  isLoading,
}: {
  entries: WALEntry[];
  isLoading: boolean;
}) {
  const recent = entries.slice(-6).reverse();

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="size-4" />
        </span>
        Write Ahead Log
      </div>

      <div className="mt-5 flex-1 space-y-2 overflow-hidden rounded-xl border border-border/70 bg-background/40 p-3 font-mono text-xs">
        {isLoading && recent.length === 0 && (
          <p className="text-muted-foreground">Loading…</p>
        )}
        {!isLoading && recent.length === 0 && (
          <p className="text-muted-foreground">No WAL entries yet.</p>
        )}
        {recent.map((e, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg bg-background/40 px-2 py-2"
          >
            <span className="min-w-[56px] text-muted-foreground">
              {formatTime(e.timestamp)}
            </span>
            <span className={`w-14 font-semibold ${opColor[e.op ?? ""] ?? ""}`}>
              {e.op ?? "—"}
            </span>
            <span className="min-w-0 truncate text-foreground">
              {e.key ?? "—"}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/wal"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-border/70 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
      >
        View WAL
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

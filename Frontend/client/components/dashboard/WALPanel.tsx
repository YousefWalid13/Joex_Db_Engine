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
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <FileText className="size-4 text-primary" />
        Write Ahead Log
      </div>

      <div className="mt-4 flex-1 space-y-2 font-mono text-xs">
        {isLoading && recent.length === 0 && (
          <p className="text-muted-foreground">Loading…</p>
        )}
        {!isLoading && recent.length === 0 && (
          <p className="text-muted-foreground">No WAL entries yet.</p>
        )}
        {recent.map((e, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-muted-foreground">{formatTime(e.timestamp)}</span>
            <span className={`w-14 font-semibold ${opColor[e.op ?? ""] ?? ""}`}>
              {e.op ?? "—"}
            </span>
            <span className="truncate text-foreground">{e.key ?? "—"}</span>
          </div>
        ))}
      </div>

      <Link
        href="/wal"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        View WAL
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

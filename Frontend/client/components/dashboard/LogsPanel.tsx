"use client";

import { ScrollText, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { WALEntry } from "@/lib/normalize";
import { formatTime } from "@/lib/format";

// Derives a log-style feed from real WAL entries (the API doesn't expose a
// dedicated log stream endpoint).
export default function LogsPanel({
  entries,
  isLoading,
}: {
  entries: WALEntry[];
  isLoading: boolean;
}) {
  const recent = entries.slice(-8).reverse();

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ScrollText className="size-4 text-primary" />
        Logs
      </div>

      <div className="mt-4 flex-1 space-y-1.5 font-mono text-[11px] leading-relaxed">
        {isLoading && recent.length === 0 && (
          <p className="text-muted-foreground">Loading…</p>
        )}
        {!isLoading && recent.length === 0 && (
          <p className="text-muted-foreground">No activity recorded yet.</p>
        )}
        {recent.map((e, i) => (
          <p key={i} className="truncate">
            <span className="text-muted-foreground">{formatTime(e.timestamp)}</span>{" "}
            <span className="text-primary">[INFO]</span>{" "}
            {e.op ? `${e.op} request` : "Engine event"}
            {e.key ? ` | key=${e.key}` : ""}
          </p>
        ))}
      </div>

      <Link
        href="/logs"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        View All Logs
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

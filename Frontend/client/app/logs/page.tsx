"use client";

import { ScrollText } from "lucide-react";
import TopBar from "@/components/topbar/TopBar";
import { useWAL } from "@/hooks/useWAL";
import { useStatus } from "@/hooks/useStatus";
import { formatTime } from "@/lib/format";

export default function LogsPage() {
  const { entries, isLoading, isError } = useWAL();
  const { isError: statusError } = useStatus();
  const ordered = [...entries].reverse();

  return (
    <main className="flex min-h-screen flex-col">
      <TopBar
        title="Logs"
        subtitle="Recent engine activity, derived from the write-ahead log"
        online={!statusError}
      />

      <section className="px-6 py-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ScrollText className="size-4 text-primary" />
            Activity Feed
          </div>

          <div className="mt-4 space-y-1.5 font-mono text-xs leading-relaxed">
            {isError && (
              <p className="text-muted-foreground">
                Couldn&apos;t reach the engine API.
              </p>
            )}
            {!isError && !isLoading && ordered.length === 0 && (
              <p className="text-muted-foreground">No activity recorded yet.</p>
            )}
            {ordered.map((e, i) => (
              <p key={i}>
                <span className="text-muted-foreground">{formatTime(e.timestamp)}</span>{" "}
                <span className="text-primary">[INFO]</span>{" "}
                {e.op ? `${e.op} request` : "Engine event"}
                {e.key ? ` | key=${e.key}` : ""}
              </p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { FileText } from "lucide-react";
import TopBar from "@/components/topbar/TopBar";
import { useWAL } from "@/hooks/useWAL";
import { useStatus } from "@/hooks/useStatus";
import { formatTime } from "@/lib/format";

const opColor: Record<string, string> = {
  PUT: "text-emerald-400",
  DELETE: "text-red-400",
  FLUSH: "text-primary",
  GET: "text-sky-400",
};

export default function WALPage() {
  const { entries, isLoading, isError } = useWAL();
  const { isError: statusError } = useStatus();
  const ordered = [...entries].reverse();

  return (
    <main className="flex min-h-screen flex-col">
      <TopBar
        title="Write-Ahead Log"
        subtitle="Durable record of every operation before it's applied"
        online={!statusError}
      />

      <section className="px-6 py-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="size-4 text-primary" />
            {entries.length} Entries
          </div>

          <div className="mt-4 overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">Operation</th>
                  <th className="py-2 pr-4 font-medium">Key</th>
                  <th className="py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {isError && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      Couldn&apos;t reach the engine API.
                    </td>
                  </tr>
                )}
                {!isError && !isLoading && ordered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      No WAL entries yet.
                    </td>
                  </tr>
                )}
                {ordered.map((e, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="py-2 pr-4 text-muted-foreground">
                      {formatTime(e.timestamp)}
                    </td>
                    <td className={`py-2 pr-4 font-semibold ${opColor[e.op ?? ""] ?? ""}`}>
                      {e.op ?? "—"}
                    </td>
                    <td className="py-2 pr-4">{e.key ?? "—"}</td>
                    <td className="py-2 text-muted-foreground">
                      {e.value !== undefined ? JSON.stringify(e.value) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

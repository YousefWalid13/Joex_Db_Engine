"use client";

import { Database, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import TopBar from "@/components/topbar/TopBar";
import { useMemTable } from "@/hooks/useMemTable";
import { useStatus } from "@/hooks/useStatus";
import { flushEngine } from "@/lib/api";
import { formatBytes, formatNumber } from "@/lib/format";

export default function MemTablePage() {
  const { memtable, isLoading, isError } = useMemTable();
  const { isError: statusError } = useStatus();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const max =
    memtable.maxBytes ??
    (memtable.sizeBytes ? memtable.sizeBytes * 2 : undefined);
  const percent =
    memtable.sizeBytes !== undefined && max
      ? Math.min(100, (memtable.sizeBytes / max) * 100)
      : undefined;

  async function handleFlush() {
    try {
      await flushEngine();

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["engine-memtable"] }),
        queryClient.invalidateQueries({ queryKey: ["engine-wal"] }),
        queryClient.invalidateQueries({ queryKey: ["engine-sstables"] }),
        queryClient.invalidateQueries({ queryKey: ["engine-status"] }),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <TopBar
        title="MemTable"
        subtitle="In-memory write buffer for the LSM engine"
        online={!statusError}
      />

      <section className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Current Size</p>
          <p className="mt-1 text-2xl font-semibold">
            {isLoading ? "…" : formatBytes(memtable.sizeBytes)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Records</p>
          <p className="mt-1 text-2xl font-semibold">
            {isLoading ? "…" : formatNumber(memtable.recordCount)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Flush Threshold</p>
          <p className="mt-1 text-2xl font-semibold">
            {percent !== undefined ? `${percent.toFixed(0)}%` : "—"}
          </p>
        </div>
      </section>

      <section className="px-6 pb-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Database className="size-4 text-primary" />
              Entries
            </div>
            <button
              type="button"
              onClick={handleFlush}
              disabled={pending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Flush Now
            </button>
          </div>

          <div className="mt-4 overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Key</th>
                  <th className="py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {isError && (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Couldn&apos;t reach the engine API.
                    </td>
                  </tr>
                )}
                {!isError && (memtable.entries?.length ?? 0) === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-6 text-center text-muted-foreground"
                    >
                      {isLoading
                        ? "Loading…"
                        : "No entries in the MemTable right now."}
                    </td>
                  </tr>
                )}
                {memtable.entries?.map((entry, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="py-2 pr-4">
                      {JSON.stringify(entry.key ?? entry.Key ?? entry)}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {JSON.stringify(entry.value ?? entry.Value ?? "")}
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

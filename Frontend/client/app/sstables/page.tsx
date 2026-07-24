"use client";

import { Archive, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import TopBar from "@/components/topbar/TopBar";
import { useSSTables } from "@/hooks/useSSTables";
import { useStatus } from "@/hooks/useStatus";
import { compactEngine } from "@/lib/api";
import { formatBytes } from "@/lib/format";

export default function SSTablesPage() {
  const { sstables, isLoading, isError } = useSSTables();
  const { isError: statusError } = useStatus();
  const queryClient = useQueryClient();
  const [compacting, setCompacting] = useState(false);
  const [compactError, setCompactError] = useState<string | null>(null);

  const levels = sstables.levels ?? {};
  const levelKeys = Object.keys(levels)
    .map(Number)
    .sort((a, b) => a - b);

  async function handleCompact() {
    setCompacting(true);
    setCompactError(null);
    try {
      await compactEngine();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["engine-sstables"] }),
        queryClient.invalidateQueries({ queryKey: ["engine-status"] }),
      ]);
    } catch {
      setCompactError("Couldn't trigger compaction. Is the engine reachable?");
    } finally {
      setCompacting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <TopBar
        title="SSTables"
        subtitle="On-disk sorted string tables by compaction level"
        online={!statusError}
      />

      <section className="px-6 py-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Archive className="size-4 text-primary" />
              {sstables.total ?? 0} Total Files
            </div>
            <button
              type="button"
              onClick={handleCompact}
              disabled={compacting}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {compacting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Zap className="size-4" />
              )}
              Force Compaction
            </button>
          </div>

          {compactError && (
            <p className="mt-3 text-sm text-red-400">{compactError}</p>
          )}

          <div className="mt-5 space-y-6">
            {isError && (
              <p className="text-sm text-muted-foreground">
                Couldn&apos;t reach the engine API.
              </p>
            )}
            {!isError && !isLoading && levelKeys.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No SSTables reported yet.
              </p>
            )}
            {levelKeys.map((lvl) => (
              <div key={lvl}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Level {lvl}</span>
                  <span className="text-xs text-muted-foreground">
                    {levels[lvl].length} files
                  </span>
                </div>
                <div className="mt-3 overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground">
                        <th className="py-2 pr-4 font-medium">File</th>
                        <th className="py-2 font-medium">Size</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {levels[lvl].map((f, i) => (
                        <tr key={i} className="border-b border-border/60">
                          <td className="py-2 pr-4">{f.name ?? `sstable_${i}.db`}</td>
                          <td className="py-2 text-muted-foreground">
                            {formatBytes(f.sizeBytes)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

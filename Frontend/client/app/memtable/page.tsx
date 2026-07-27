"use client";

import { Database, Save, Loader2, Archive } from "lucide-react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import TopBar from "@/components/topbar/TopBar";
import { useMemTable } from "@/hooks/useMemTable";
import { useStatus } from "@/hooks/useStatus";
import { compactEngine, flushEngine } from "@/lib/api";
import { formatBytes, formatNumber } from "@/lib/format";

function parsePotentialJSON(value: unknown): unknown {
  if (typeof value !== "string") return value;
  let trimmed = value.trim();
  if (!trimmed) return value;

  try {
    let parsed = JSON.parse(trimmed);
    if (typeof parsed === "string") {
      const nested = parsed.trim();
      if (nested.startsWith("{") || nested.startsWith("[")) {
        parsed = JSON.parse(nested);
      }
    }
    return parsed;
  } catch {
    return value;
  }
}

function formatMemtableValue(value: unknown) {
  const parsed = parsePotentialJSON(value);
  if (parsed === undefined || parsed === null) return String(parsed);
  if (typeof parsed === "string") return parsed;
  if (typeof parsed === "object") return JSON.stringify(parsed, null, 2);
  return String(parsed);
}

function getEntryKey(
  entry: { key?: unknown; value?: unknown } & Record<string, unknown>,
  fallback: number,
) {
  if (typeof entry.key === "string" && entry.key) return entry.key;
  const pascalKey = entry.Key;
  if (typeof pascalKey === "string" && pascalKey) return pascalKey;
  return `entry-${fallback}`;
}

export default function MemTablePage() {
  const { memtable, isLoading, isError } = useMemTable();
  const { isError: statusError } = useStatus();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const max =
    memtable.maxBytes ??
    (memtable.sizeBytes ? memtable.sizeBytes * 2 : undefined);
  const percent =
    memtable.sizeBytes !== undefined && max
      ? Math.min(100, (memtable.sizeBytes / max) * 100)
      : undefined;

  const entryRows = useMemo(
    () =>
      Array.isArray(memtable.entries)
        ? memtable.entries
        : memtable.entries && typeof memtable.entries === "object"
          ? Object.entries(memtable.entries).map(([key, value]) => ({
              key,
              value,
            }))
          : [],
    [memtable.entries],
  );

  async function handleFlush() {
    setPending(true);
    setFeedback(null);
    try {
      await flushEngine();
      setFeedback("Flush completed successfully.");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["engine-memtable"] }),
        queryClient.invalidateQueries({ queryKey: ["engine-wal"] }),
        queryClient.invalidateQueries({ queryKey: ["engine-sstables"] }),
        queryClient.invalidateQueries({ queryKey: ["engine-status"] }),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setPending(false);
    }
  }

  async function handleCompact() {
    setPending(true);
    setFeedback(null);
    try {
      const result = await compactEngine();
      setFeedback(result?.message ?? "Compaction completed successfully.");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["engine-memtable"] }),
        queryClient.invalidateQueries({ queryKey: ["engine-wal"] }),
        queryClient.invalidateQueries({ queryKey: ["engine-sstables"] }),
        queryClient.invalidateQueries({ queryKey: ["engine-status"] }),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <TopBar
        title="MemTable"
        subtitle="In-memory write buffer for the LSM engine"
        online={!statusError}
      />

      <section className="grid grid-cols-1 gap-4 px-4 py-5 sm:px-6 md:grid-cols-3">
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

      <section className="px-4 pb-6 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Database className="size-4 text-primary" />
              Entries
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleFlush}
                disabled={pending}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Flush Now
              </button>
              <button
                type="button"
                onClick={handleCompact}
                disabled={pending}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-secondary disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Archive className="size-4" />
                )}
                Compact SSTables
              </button>
            </div>
          </div>

          {feedback ? (
            <p className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              {feedback}
            </p>
          ) : null}

          <div className="mt-4 overflow-x-auto scrollbar-thin">
            {isError ? (
              <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                Couldn&apos;t reach the engine API.
              </div>
            ) : entryRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                {isLoading
                  ? "Loading…"
                  : "No entries in the MemTable right now."}
              </div>
            ) : (
              <div className="space-y-3">
                {entryRows.map((entry, i) => (
                  <div
                    key={`${getEntryKey(entry, i)}-${i}`}
                    className="rounded-xl border border-border/70 bg-background/60 p-4 md:grid md:grid-cols-[minmax(0,220px)_1fr] md:gap-4"
                  >
                    <div className="mb-3 md:mb-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Key
                      </p>
                      <p className="mt-1 break-all font-mono text-sm">
                        {JSON.stringify(getEntryKey(entry, i))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Value
                      </p>
                      <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-sm text-muted-foreground">
                        {formatMemtableValue(entry.value ?? "")}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { Settings, Tag, Network } from "lucide-react";
import TopBar from "@/components/topbar/TopBar";
import { useStatus } from "@/hooks/useStatus";
import { API_BASE_URL } from "@/lib/api";
import { formatUptime } from "@/lib/format";

export default function SettingsPage() {
  const { status, isError } = useStatus();

  return (
    <main className="flex min-h-screen flex-col">
      <TopBar
        title="Settings"
        subtitle="Connection and engine configuration"
        online={!isError}
      />

      <section className="grid grid-cols-1 gap-4 px-6 py-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Network className="size-4 text-primary" />
            Backend Connection
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">API base URL</dt>
              <dd className="font-mono text-xs">{API_BASE_URL}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Status</dt>
              <dd className={isError ? "text-red-400" : "text-emerald-400"}>
                {isError ? "Unreachable" : "Connected"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Node ID</dt>
              <dd>{status.nodeId ?? "node-01"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Cluster</dt>
              <dd>{status.cluster ?? "local-cluster"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Override with the <code className="font-mono">NEXT_PUBLIC_API_BASE_URL</code>{" "}
            environment variable at build time.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Tag className="size-4 text-primary" />
            Engine Info
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Version</dt>
              <dd>{status.version ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Uptime</dt>
              <dd>{formatUptime(status.uptimeSeconds)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Active Connections</dt>
              <dd>{status.connections ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Settings className="size-4 text-primary" />
            About
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            JOEX DB Engine is an LSM-tree based storage engine. This dashboard
            polls the hosted API for live status, MemTable, SSTable, and
            write-ahead log data, and can trigger a MemTable flush or forced
            compaction directly from the UI.
          </p>
        </div>
      </section>
    </main>
  );
}

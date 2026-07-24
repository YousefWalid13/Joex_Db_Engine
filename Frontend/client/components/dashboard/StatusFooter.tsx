"use client";

import { Clock, Tag, Network, HardDrive, Cpu } from "lucide-react";
import { formatUptime, formatPercent, formatBytes } from "@/lib/format";
import type { EngineStatusView } from "@/lib/normalize";

export default function StatusFooter({ status }: { status: EngineStatusView }) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-border px-6 py-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Clock className="size-3.5" />
        Uptime: <span className="font-medium text-foreground">{formatUptime(status.uptimeSeconds)}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Tag className="size-3.5" />
        Version: <span className="font-medium text-foreground">{status.version ?? "—"}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Network className="size-3.5" />
        Connections: <span className="font-medium text-foreground">{status.connections ?? "—"}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <HardDrive className="size-3.5" />
        Heap Usage:{" "}
        <span className="font-medium text-foreground">
          {status.heapUsedBytes !== undefined
            ? `${formatBytes(status.heapUsedBytes, 0)} / ${formatBytes(status.heapTotalBytes, 0)}`
            : "—"}
        </span>
      </span>
      <span className="ml-auto flex items-center gap-1.5">
        <Cpu className="size-3.5" />
        CPU Usage:{" "}
        <span className="font-medium text-foreground">
          {formatPercent(status.cpuUsagePercent, 0)}
        </span>
      </span>
    </div>
  );
}

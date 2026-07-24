"use client";

import {
  Activity,
  Clock,
  PenLine,
  HardDrive,
  Layers,
  Database,
  RefreshCw,
} from "lucide-react";
import TopBar from "@/components/topbar/TopBar";
import EngineControls from "@/components/engine/EngineControls";
import MetricCard from "@/components/cards/MetricCard";
import MemTablePanel from "@/components/dashboard/MemTablePanel";
import SSTablesPanel from "@/components/dashboard/SSTablesPanel";
import CompactionPanel from "@/components/dashboard/CompactionPanel";
import BloomFilterPanel from "@/components/dashboard/BloomFilterPanel";
import WALPanel from "@/components/dashboard/WALPanel";
import LogsPanel from "@/components/dashboard/LogsPanel";
import StatusFooter from "@/components/dashboard/StatusFooter";
import { useStatus } from "@/hooks/useStatus";
import { useMemTable } from "@/hooks/useMemTable";
import { useSSTables } from "@/hooks/useSSTables";
import { useWAL } from "@/hooks/useWAL";
import { useHistory } from "@/hooks/useStatistics";
import { formatMs, formatNumber, splitBytes } from "@/lib/format";

export default function DashboardPage() {
  const { status, isError: statusError } = useStatus();
  const { memtable, isLoading: memtableLoading } = useMemTable();
  const { sstables, isLoading: sstablesLoading } = useSSTables();
  const { entries: walEntries, isLoading: walLoading } = useWAL();

  const requestsHistory = useHistory(status.requestsPerSec);
  const readHistory = useHistory(status.readLatencyMs);
  const writeHistory = useHistory(status.writeLatencyMs);

  const diskUsed = splitBytes(status.diskUsageBytes, 1);
  const memtableSize = splitBytes(status.memtableSizeBytes ?? memtable.sizeBytes, 0);
  const diskPercent =
    status.diskUsageBytes !== undefined && status.diskUsageTotalBytes
      ? (status.diskUsageBytes / status.diskUsageTotalBytes) * 100
      : undefined;

  return (
    <main className="flex min-h-screen flex-col">
      <TopBar
        title="Dashboard"
        subtitle="Real-time overview of your database engine"
        online={!statusError}
      />
      <EngineControls running={status.running ?? !statusError} />

      <section className="grid grid-cols-2 gap-4 px-6 pt-5 sm:grid-cols-3 xl:grid-cols-7">
        <MetricCard
          icon={Activity}
          label="Requests / sec"
          value={formatNumber(status.requestsPerSec)}
          history={requestsHistory}
        />
        <MetricCard
          icon={Clock}
          label="Read Latency"
          value={formatMs(status.readLatencyMs)}
          unit="ms"
          history={readHistory}
        />
        <MetricCard
          icon={PenLine}
          label="Write Latency"
          value={formatMs(status.writeLatencyMs)}
          unit="ms"
          history={writeHistory}
        />
        <MetricCard
          icon={HardDrive}
          label="Disk Usage"
          value={diskUsed.value}
          unit={diskUsed.unit}
          progress={
            diskPercent !== undefined
              ? { percent: diskPercent, label: `${diskPercent.toFixed(0)}%` }
              : undefined
          }
        />
        <MetricCard
          icon={Layers}
          label="SSTables"
          value={formatNumber(sstables.total)}
          unit="Files"
        />
        <MetricCard
          icon={Database}
          label="MemTable Size"
          value={memtableSize.value}
          unit={memtableSize.unit}
        />
        <MetricCard
          icon={RefreshCw}
          label="Compactions"
          value={formatNumber(status.activeCompactions)}
          unit="Active"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 px-6 pt-5 lg:grid-cols-3">
        <MemTablePanel memtable={memtable} isLoading={memtableLoading} />
        <SSTablesPanel sstables={sstables} isLoading={sstablesLoading} />
        <CompactionPanel sstables={sstables} activeCompactions={status.activeCompactions} />
      </section>

      <section className="grid grid-cols-1 gap-4 px-6 py-5 lg:grid-cols-3">
        <BloomFilterPanel />
        <WALPanel entries={walEntries} isLoading={walLoading} />
        <LogsPanel entries={walEntries} isLoading={walLoading} />
      </section>

      <div className="mt-auto">
        <StatusFooter status={status} />
      </div>
    </main>
  );
}

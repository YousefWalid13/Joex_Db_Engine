/**
 * The live JOEX DB Engine API's exact JSON field naming isn't fully known
 * ahead of time, so these helpers look up a value under several likely
 * key spellings (camelCase / snake_case / short aliases) and fall back to
 * `undefined` if nothing matches, rather than throwing.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObj = Record<string, any>;

export function pick(obj: AnyObj | undefined | null, keys: string[]) {
  if (!obj) return undefined;
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null) return val;
  }
  return undefined;
}

export function pickNumber(
  obj: AnyObj | undefined | null,
  keys: string[],
): number | undefined {
  const val = pick(obj, keys);
  if (val === undefined) return undefined;
  const n = typeof val === "string" ? parseFloat(val) : Number(val);
  return Number.isFinite(n) ? n : undefined;
}

export function pickArray(
  obj: AnyObj | undefined | null,
  keys: string[],
): unknown[] | undefined {
  const val = pick(obj, keys);
  return Array.isArray(val) ? val : undefined;
}

export function pickString(
  obj: AnyObj | undefined | null,
  keys: string[],
): string | undefined {
  const val = pick(obj, keys);
  return val === undefined ? undefined : String(val);
}

export function pickBool(
  obj: AnyObj | undefined | null,
  keys: string[],
): boolean | undefined {
  const val = pick(obj, keys);
  if (val === undefined) return undefined;
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true";
  return Boolean(val);
}

export interface EngineStatusView {
  running?: boolean;
  requestsPerSec?: number;
  readLatencyMs?: number;
  writeLatencyMs?: number;
  diskUsageBytes?: number;
  diskUsageTotalBytes?: number;
  sstableCount?: number;
  memtableSizeBytes?: number;
  memtableMaxBytes?: number;
  activeCompactions?: number;
  uptimeSeconds?: number;
  version?: string;
  connections?: number;
  heapUsedBytes?: number;
  heapTotalBytes?: number;
  cpuUsagePercent?: number;
  nodeId?: string;
  cluster?: string;
}

export function normalizeStatus(
  raw: AnyObj | undefined | null,
): EngineStatusView {
  if (!raw) return {};
  // Some APIs nest everything under a `data`/`status`/`metrics` key.
  const root: AnyObj = (raw.data as AnyObj) ?? (raw.status as AnyObj) ?? raw;
  const metrics: AnyObj = (root.metrics as AnyObj) ?? root;

  return {
    running: pickBool(root, ["running", "isRunning", "server_running", "up"]),
    requestsPerSec: pickNumber(metrics, [
      "requestsPerSec",
      "requests_per_sec",
      "requestsPerSecond",
      "rps",
      "throughput",
    ]),
    readLatencyMs: pickNumber(metrics, [
      "readLatencyMs",
      "read_latency_ms",
      "readLatency",
      "read_latency",
    ]),
    writeLatencyMs: pickNumber(metrics, [
      "writeLatencyMs",
      "write_latency_ms",
      "writeLatency",
      "write_latency",
    ]),
    diskUsageBytes: pickNumber(metrics, [
      "diskUsageBytes",
      "disk_usage_bytes",
      "diskUsage",
      "disk_usage",
    ]),
    diskUsageTotalBytes: pickNumber(metrics, [
      "diskTotalBytes",
      "disk_total_bytes",
      "diskCapacityBytes",
    ]),
    sstableCount: pickNumber(metrics, [
      "sstableCount",
      "sstable_count",
      "sstables",
      "numSSTables",
    ]),
    memtableSizeBytes: pickNumber(metrics, [
      "memtableSizeBytes",
      "memtable_size_bytes",
      "memtableSize",
      "memtable_size",
    ]),
    memtableMaxBytes: pickNumber(metrics, [
      "memtableMaxBytes",
      "memtable_max_bytes",
      "memtableCapacity",
      "memtable_capacity",
      "memtableThreshold",
    ]),
    activeCompactions: pickNumber(metrics, [
      "activeCompactions",
      "active_compactions",
      "compactions",
      "compactionsActive",
    ]),
    uptimeSeconds: pickNumber(root, [
      "uptimeSeconds",
      "uptime_seconds",
      "uptime",
    ]),
    version: pickString(root, ["version", "engineVersion", "engine_version"]),
    connections: pickNumber(metrics, [
      "connections",
      "activeConnections",
      "active_connections",
    ]),
    heapUsedBytes: pickNumber(metrics, [
      "heapUsedBytes",
      "heap_used_bytes",
      "heapUsed",
    ]),
    heapTotalBytes: pickNumber(metrics, [
      "heapTotalBytes",
      "heap_total_bytes",
      "heapTotal",
    ]),
    cpuUsagePercent: pickNumber(metrics, [
      "cpuUsagePercent",
      "cpu_usage_percent",
      "cpuUsage",
      "cpu_percent",
    ]),
    nodeId: pickString(root, ["nodeId", "node_id"]),
    cluster: pickString(root, ["cluster", "clusterName", "cluster_name"]),
  };
}

export interface MemTableView {
  sizeBytes?: number;
  maxBytes?: number;
  recordCount?: number;
  entries?: AnyObj[];
}

export function normalizeMemTable(
  raw: AnyObj | undefined | null,
): MemTableView {
  if (!raw) return {};
  const root: AnyObj = (raw.data as AnyObj) ?? raw;
  const entries = pickArray(root, ["entries", "records", "items", "keys"]) as
    | AnyObj[]
    | undefined;
  return {
    sizeBytes: pickNumber(root, [
      "sizeBytes",
      "size_bytes",
      "size",
      "currentSize",
    ]),
    maxBytes: pickNumber(root, [
      "maxBytes",
      "max_bytes",
      "capacity",
      "threshold",
    ]),
    recordCount:
      pickNumber(root, [
        "recordCount",
        "record_count",
        "count",
        "numRecords",
      ]) ?? entries?.length,
    entries,
  };
}

export interface SSTableFile {
  name?: string;
  level?: number;
  sizeBytes?: number;
}

export interface SSTablesView {
  total?: number;
  levels?: Record<number, SSTableFile[]>;
  files?: SSTableFile[];
}

export function normalizeSSTables(
  raw: AnyObj | AnyObj[] | undefined | null,
): SSTablesView {
  if (!raw) return {};

  // Backend returns an array directly
  const rawFiles = Array.isArray(raw)
    ? raw
    : ((pickArray(raw.data ?? raw, ["sstables", "files", "items", "tables"]) as
        | AnyObj[]
        | undefined) ?? []);

  const files: SSTableFile[] = rawFiles.map((f) => ({
    name: pickString(f, ["name", "filename", "file", "id"]),
    level: pickNumber(f, ["level", "lvl"]) ?? 0,
    sizeBytes: pickNumber(f, ["sizeBytes", "size_bytes", "size"]) ?? 0,
  }));

  const levels: Record<number, SSTableFile[]> = {};

  for (const file of files) {
    const level = file.level ?? 0;

    if (!levels[level]) {
      levels[level] = [];
    }

    levels[level].push(file);
  }

  return {
    total: files.length,
    levels,
    files,
  };
}

export interface WALEntry {
  timestamp?: string;
  op?: string;
  key?: string;
  value?: unknown;
}

export function normalizeWAL(raw: AnyObj | undefined | null): WALEntry[] {
  if (!raw) return [];
  const root: AnyObj = (raw.data as AnyObj) ?? raw;
  const rawEntries =
    (pickArray(root, ["entries", "records", "log", "items"]) as
      | AnyObj[]
      | undefined) ?? (Array.isArray(raw) ? (raw as AnyObj[]) : undefined);

  return (rawEntries ?? []).map((e) => ({
    timestamp: pickString(e, ["timestamp", "time", "ts"]),
    op: pickString(e, ["op", "operation", "type", "command"])?.toUpperCase(),
    key: pickString(e, ["key"]),
    value: pick(e, ["value", "val"]),
  }));
}

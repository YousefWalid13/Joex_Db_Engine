export function formatBytes(bytes: number | undefined, decimals = 1): string {
  if (bytes === undefined || Number.isNaN(bytes)) return "—";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(Math.abs(bytes)) / Math.log(k)),
    sizes.length - 1,
  );
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}

export function splitBytes(bytes: number | undefined, decimals = 1) {
  const full = formatBytes(bytes, decimals);
  const [value, unit] = full.split(" ");
  return { value, unit: unit ?? "" };
}

export function formatNumber(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatMs(n: number | undefined, decimals = 2): string {
  if (n === undefined || Number.isNaN(n)) return "—";
  return n.toFixed(decimals);
}

export function formatPercent(n: number | undefined, decimals = 0): string {
  if (n === undefined || Number.isNaN(n)) return "—";
  return `${n.toFixed(decimals)}%`;
}

export function formatUptime(seconds: number | undefined): string {
  if (seconds === undefined || Number.isNaN(seconds)) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function formatTime(input: string | undefined): string {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleTimeString("en-US", { hour12: false });
}

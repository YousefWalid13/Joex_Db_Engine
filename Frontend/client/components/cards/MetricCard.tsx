"use client";

import type { LucideIcon } from "lucide-react";
import Sparkline from "@/components/charts/Sparkline";

export default function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  history,
  progress,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  history?: number[];
  progress?: { percent: number; label: string };
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{value}</span>
        {unit && (
          <span className="text-xs font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {progress ? (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
            />
          </div>
          <p className="mt-1 text-right text-[11px] text-muted-foreground">
            {progress.label}
          </p>
        </div>
      ) : (
        <div className="mt-2">
          <Sparkline data={history ?? []} width={140} height={32} />
        </div>
      )}
    </div>
  );
}

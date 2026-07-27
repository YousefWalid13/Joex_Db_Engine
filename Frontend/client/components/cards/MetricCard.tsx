"use client";

import type { LucideIcon } from "lucide-react";
import Sparkline from "@/components/charts/Sparkline";
import { cn } from "@/lib/utils";

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
    <div className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        {label}
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        {unit ? (
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </div>
      {progress ? (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/80">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{
                width: `${Math.min(100, Math.max(0, progress.percent))}%`,
              }}
            />
          </div>
          <p className="mt-2 text-right text-[11px] text-muted-foreground">
            {progress.label}
          </p>
        </div>
      ) : (
        <div className="mt-4 flex-1">
          <Sparkline data={history ?? []} width={140} height={32} />
        </div>
      )}
    </div>
  );
}

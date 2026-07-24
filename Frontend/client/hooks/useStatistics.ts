"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Keeps a rolling window of recent values for a metric so metric cards can
 * render a small sparkline built from real polled values instead of a
 * single point-in-time number.
 */
export function useHistory(value: number | undefined, size = 20) {
  const [history, setHistory] = useState<number[]>([]);
  const last = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (value === undefined || Number.isNaN(value)) return;
    if (last.current === value) return;
    last.current = value;
    setHistory((prev) => {
      const next = [...prev, value];
      return next.length > size ? next.slice(next.length - size) : next;
    });
  }, [value, size]);

  return history;
}

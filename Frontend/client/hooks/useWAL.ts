"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWAL } from "@/lib/api";
import { normalizeWAL } from "@/lib/normalize";

export function useWAL(pollMs = 4000) {
  const query = useQuery({
    queryKey: ["engine-wal"],
    queryFn: fetchWAL,
    refetchInterval: pollMs,
  });

  return {
    ...query,
    entries: normalizeWAL(query.data),
  };
}

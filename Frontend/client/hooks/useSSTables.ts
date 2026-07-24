"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSSTables } from "@/lib/api";
import { normalizeSSTables } from "@/lib/normalize";

export function useSSTables(pollMs = 5000) {
  const query = useQuery({
    queryKey: ["engine-sstables"],
    queryFn: fetchSSTables,
    refetchInterval: pollMs,
  });

  return {
    ...query,
    sstables: normalizeSSTables(query.data),
  };
}

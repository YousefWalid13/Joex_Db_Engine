"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEngineStatus } from "@/lib/api";
import { normalizeStatus } from "@/lib/normalize";

export function useStatus(pollMs = 4000) {
  const query = useQuery({
    queryKey: ["engine-status"],
    queryFn: fetchEngineStatus,
    refetchInterval: pollMs,
  });

  return {
    ...query,
    status: normalizeStatus(query.data),
  };
}

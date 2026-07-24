"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMemTable } from "@/lib/api";
import { normalizeMemTable } from "@/lib/normalize";

export function useMemTable(pollMs = 4000) {
  const query = useQuery({
    queryKey: ["engine-memtable"],
    queryFn: fetchMemTable,
    refetchInterval: pollMs,
  });

  return {
    ...query,
    memtable: normalizeMemTable(query.data),
  };
}

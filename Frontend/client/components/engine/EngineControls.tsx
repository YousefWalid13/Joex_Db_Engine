"use client";

import { useEffect, useState } from "react";
import { Play, Square, Save, Zap, Loader2 } from "lucide-react";
import { flushEngine, compactEngine, startEngine, stopEngine } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

type PendingAction = "flush" | "compact" | "start" | "stop" | null;

export default function EngineControls({ running }: { running?: boolean }) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<PendingAction>(null);
  const [serverRunning, setServerRunning] = useState(Boolean(running));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setServerRunning(Boolean(running));
  }, [running]);

  async function handleAction(action: "start" | "stop") {
    setPending(action);
    setStatusMessage(null);

    try {
      if (action === "start") {
        await startEngine();
        setServerRunning(true);
        setStatusMessage("Server started successfully.");
      } else {
        await stopEngine();
        setServerRunning(false);
        setStatusMessage("Server stopped successfully.");
      }

      await queryClient.invalidateQueries({ queryKey: ["engine-status"] });
      await queryClient.invalidateQueries({ queryKey: ["engine-memtable"] });
      await queryClient.invalidateQueries({ queryKey: ["engine-sstables"] });
      await queryClient.invalidateQueries({ queryKey: ["engine-wal"] });
    } catch (error) {
      setStatusMessage(describeError(error));
    } finally {
      setPending(null);
    }
  }

  async function handleFlush() {
    setPending("flush");
    setStatusMessage(null);
    try {
      await flushEngine();
      await queryClient.invalidateQueries({ queryKey: ["engine-memtable"] });
      await queryClient.invalidateQueries({ queryKey: ["engine-status"] });
      setStatusMessage("MemTable flushed.");
    } catch (error) {
      setStatusMessage(describeError(error));
    } finally {
      setPending(null);
    }
  }

  async function handleCompact() {
    setPending("compact");
    setStatusMessage(null);
    try {
      await compactEngine();
      await queryClient.invalidateQueries({ queryKey: ["engine-sstables"] });
      await queryClient.invalidateQueries({ queryKey: ["engine-status"] });
      setStatusMessage("Compaction requested.");
    } catch (error) {
      setStatusMessage(describeError(error));
    } finally {
      setPending(null);
    }
  }

  const baseBtn =
    "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 pt-5">
      <button
        type="button"
        onClick={() => handleAction("start")}
        disabled={pending !== null || serverRunning}
        className={`${baseBtn} bg-primary text-primary-foreground hover:bg-primary/90`}
      >
        {pending === "start" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Play className="size-4" />
        )}
        Start Server
      </button>
      <button
        type="button"
        onClick={() => handleAction("stop")}
        disabled={pending !== null || !serverRunning}
        className={`${baseBtn} border border-border bg-transparent text-foreground hover:bg-secondary`}
      >
        {pending === "stop" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Square className="size-4" />
        )}
        Stop Server
      </button>
      <button
        type="button"
        onClick={handleFlush}
        disabled={pending !== null}
        className={`${baseBtn} border border-border bg-card text-foreground hover:bg-secondary`}
      >
        {pending === "flush" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Flush MemTable
      </button>
      <button
        type="button"
        onClick={handleCompact}
        disabled={pending !== null}
        className={`${baseBtn} border border-border bg-card text-foreground hover:bg-secondary`}
      >
        {pending === "compact" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Zap className="size-4" />
        )}
        Force Compaction
      </button>

      <div className="ml-auto flex flex-col items-end gap-2">
        <span
          className={`flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium ${
            serverRunning ? "text-emerald-400" : "text-muted-foreground"
          }`}
        >
          <span
            className={`size-2 rounded-full ${serverRunning ? "bg-emerald-500" : "bg-muted-foreground"}`}
          />
          {serverRunning ? "Server Running" : "Server Stopped"}
        </span>
        {statusMessage ? (
          <span className="text-xs text-muted-foreground">{statusMessage}</span>
        ) : null}
      </div>
    </div>
  );
}

function describeError(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (
      error as {
        response?: {
          status?: number;
          data?: { message?: string; error?: string };
        };
      }
    ).response;
    const message =
      response?.data?.message ?? response?.data?.error ?? "Request failed";
    return response?.status
      ? `${response.status}: ${message}`
      : String(message);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The request could not be completed.";
}

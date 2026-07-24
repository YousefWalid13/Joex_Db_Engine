"use client";

import { useState } from "react";
import { KeyRound, Search, Plus, Trash2, Loader2, Upload } from "lucide-react";
import TopBar from "@/components/topbar/TopBar";
import { useStatus } from "@/hooks/useStatus";
import { getData, putData, deleteData, uploadDataFile } from "@/lib/api";

type ResultState =
  | { kind: "idle" }
  | { kind: "success"; action: string; payload: string }
  | { kind: "error"; action: string; message: string };

function parseValue(raw: string): unknown {
  if (raw.trim() === "") return "";
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export default function DataPage() {
  const { isError: statusError } = useStatus();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pending, setPending] = useState<
    "get" | "put" | "delete" | "upload" | null
  >(null);
  const [result, setResult] = useState<ResultState>({ kind: "idle" });

  const canSubmit = key.trim().length > 0 && pending === null;
  const canUpload = selectedFile !== null && pending === null;

  async function handleGet() {
    if (!key.trim()) return;
    setPending("get");
    try {
      const data = await getData(key.trim());
      setResult({
        kind: "success",
        action: "GET",
        payload: JSON.stringify(data, null, 2),
      });
    } catch (err) {
      setResult({ kind: "error", action: "GET", message: describeError(err) });
    } finally {
      setPending(null);
    }
  }

  async function handlePut() {
    if (!key.trim()) return;
    setPending("put");
    try {
      const data = await putData(key.trim(), parseValue(value));
      setResult({
        kind: "success",
        action: "PUT",
        payload: JSON.stringify(data ?? { ok: true }, null, 2),
      });
    } catch (err) {
      setResult({ kind: "error", action: "PUT", message: describeError(err) });
    } finally {
      setPending(null);
    }
  }

  async function handleDelete() {
    if (!key.trim()) return;
    setPending("delete");
    try {
      const data = await deleteData(key.trim());
      setResult({
        kind: "success",
        action: "DELETE",
        payload: JSON.stringify(data ?? { ok: true }, null, 2),
      });
    } catch (err) {
      setResult({
        kind: "error",
        action: "DELETE",
        message: describeError(err),
      });
    } finally {
      setPending(null);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setPending("upload");
    try {
      const data = await uploadDataFile(selectedFile);
      setResult({
        kind: "success",
        action: "UPLOAD",
        payload: JSON.stringify(data ?? { ok: true }, null, 2),
      });
    } catch (err) {
      setResult({
        kind: "error",
        action: "UPLOAD",
        message: describeError(err),
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <TopBar
        title="Data"
        subtitle="Add, look up, and remove individual keys"
        online={!statusError}
      />

      <section className="grid grid-cols-1 gap-4 px-6 py-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <KeyRound className="size-4 text-primary" />
            Key / Value
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label
                className="text-xs text-muted-foreground"
                htmlFor="data-key"
              >
                Key
              </label>
              <input
                id="data-key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="user:1"
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 font-mono text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                className="text-xs text-muted-foreground"
                htmlFor="data-value"
              >
                Value{" "}
                <span className="text-muted-foreground/70">
                  (JSON or plain text — used for Add)
                </span>
              </label>
              <textarea
                id="data-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder='{"name":"Ali"}'
                rows={5}
                className="mt-1 w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 font-mono text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={handlePut}
                disabled={!canSubmit}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending === "put" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Add / Update
              </button>
              <button
                type="button"
                onClick={handleGet}
                disabled={!canSubmit}
                className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold transition hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending === "get" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Get
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canSubmit}
                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending === "delete" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete
              </button>
            </div>

            <div className="rounded-xl border border-border bg-secondary/50 p-3">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="data-upload"
              >
                Upload a file
              </label>
              <input
                id="data-upload"
                type="file"
                accept=".json,.txt,.csv,.ndjson,.log"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!canUpload}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending === "upload" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  Upload File
                </button>
                {selectedFile ? (
                  <span className="text-xs text-muted-foreground">
                    Selected: {selectedFile.name}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Choose a JSON, text, CSV, NDJSON, or log file.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Result</span>
            {result.kind !== "idle" && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  result.kind === "success"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {result.action} {result.kind === "success" ? "OK" : "failed"}
              </span>
            )}
          </div>

          <div className="mt-4">
            {result.kind === "idle" && (
              <p className="text-sm text-muted-foreground">
                Run a Get, Add, Delete, or upload a file to see the response
                here.
              </p>
            )}
            {result.kind === "success" && (
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-secondary p-3 font-mono text-xs">
                {result.payload}
              </pre>
            )}
            {result.kind === "error" && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {result.message}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function describeError(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const anyErr = err as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
        message?: string;
      };
    };
    const status = anyErr.response?.status;
    const message =
      anyErr.response?.data?.message ??
      anyErr.response?.data?.error ??
      anyErr.response?.message ??
      "Request failed";
    return status
      ? `${status}: ${message}`
      : String(message ?? "Request failed");
  }
  if (err instanceof Error) return err.message;
  return "Request failed. Is the engine reachable?";
}

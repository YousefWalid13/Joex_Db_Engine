import axios from "axios";

interface DeleteSuccessResponse {
  key: string;
  status: "deleted";
}

interface DeleteNotFoundResponse {
  status: "not_found";
  message: string;
}

const fallbackBaseUrl =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5197"
    : "https://joex-db-engine-wandering-grass-7853.fly.dev/";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || fallbackBaseUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Engine ----
export async function fetchEngineStatus() {
  const res = await api.get("/api/engine/status");
  return res.data;
}

export async function fetchMemTable() {
  const res = await api.get("/api/engine/memtable");
  return res.data;
}

export async function fetchSSTables() {
  const res = await api.get("/api/engine/sstables");
  return res.data;
}

export async function fetchWAL() {
  const res = await api.get("/api/engine/wal");
  return res.data;
}

export async function startEngine() {
  const res = await api.post("/api/engine/start", {});
  return res.data;
}

export async function stopEngine() {
  const res = await api.post("/api/engine/stop", {});
  return res.data;
}

export async function flushEngine() {
  const res = await api.post("/api/engine/flush");
  return res.data;
}

export async function compactEngine() {
  const res = await api.post("/api/engine/compact");
  return res.data;
}

// ---- Data ----
export async function getData(key: string) {
  const res = await api.get(`/api/data/${encodeURIComponent(key)}`);
  return res.data;
}

export async function putData(key: string, value: unknown) {
  if (!key?.trim()) {
    throw new Error("Key is required");
  }

  if (value === undefined || value === null) {
    throw new Error("Value is required for put");
  }

  const res = await api.put(`/api/data/${encodeURIComponent(key)}`, {
    value,
  });

  return res.data;
}

export async function deleteData(
  key: string,
): Promise<DeleteSuccessResponse | DeleteNotFoundResponse> {
  if (!key?.trim()) {
    throw new Error("Key is required for deletion");
  }

  try {
    const res = await api.delete<DeleteSuccessResponse>(
      `/api/data/${encodeURIComponent(key)}`,
    );
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        status: "not_found",
        message: error.response.data?.message ?? `Key '${key}' was not found.`,
      };
    }

    throw error;
  }
}

export async function uploadDataFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const endpoints = [
    "/api/data/upload",
    "/api/upload",
    "/api/files/upload",
    "/api/engine/upload",
  ];

  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      lastError = error;
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Upload endpoint is not available");
}

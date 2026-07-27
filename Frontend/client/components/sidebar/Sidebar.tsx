"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Database,
  LayoutDashboard,
  ChevronDown,
  Layers,
  Archive,
  ScrollText,
  FileText,
  Settings,
  KeyRound,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const storageItems = [
  { label: "MemTable", href: "/memtable" },
  { label: "SSTables", href: "/sstables" },
  { label: "Write Ahead Log", href: "/wal" },
  { label: "Data", href: "/data" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [storageOpen, setStorageOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;
  const storageActive = storageItems.some((item) => isActive(item.href));

  const navigate = (href: string) => {
    router.push(href);
    setMobileOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-[70] flex size-11 items-center justify-center rounded-xl border border-border/80 bg-background/90 text-foreground shadow-lg shadow-black/20 backdrop-blur md:hidden"
        onClick={() => setMobileOpen((value) => !value)}
        aria-label="Toggle navigation"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm md:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[65] flex h-screen w-[260px] shrink-0 flex-col border-r border-border/70 bg-sidebar/95 shadow-[16px_0_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur transition-all duration-300 md:sticky md:top-0 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="border-b border-border/70 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm shadow-primary/10">
              <Database className="size-5" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold tracking-[0.2em] text-foreground">
                JOX DB ENGINE
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                LSM Storage Engine
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
              isActive("/dashboard")
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/80 hover:bg-secondary hover:text-foreground",
            )}
          >
            <LayoutDashboard className="size-4" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setStorageOpen((value) => !value)}
            aria-expanded={storageOpen}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
              storageActive
                ? "text-primary"
                : "text-foreground/80 hover:bg-secondary hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-3">
              <Layers className="size-4" />
              <span>Storage</span>
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-200",
                storageOpen ? "rotate-0" : "-rotate-90",
              )}
            />
          </button>

          {storageOpen ? (
            <div className="ml-4 space-y-1 border-l border-border/70 pl-3.5">
              {storageItems.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200",
                    isActive(item.href)
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {item.label === "SSTables" ? (
                    <Archive className="size-3.5" />
                  ) : item.label === "Write Ahead Log" ? (
                    <FileText className="size-3.5" />
                  ) : item.label === "MemTable" ? (
                    <Database className="size-3.5" />
                  ) : (
                    <KeyRound className="size-3.5" />
                  )}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="my-2 border-t border-border/70" />

          <button
            type="button"
            onClick={() => navigate("/logs")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
              isActive("/logs")
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/80 hover:bg-secondary hover:text-foreground",
            )}
          >
            <ScrollText className="size-4" />
            <span>Logs</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
              isActive("/settings")
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/80 hover:bg-secondary hover:text-foreground",
            )}
          >
            <Settings className="size-4" />
            <span>Settings</span>
          </button>
        </nav>

        <div className="mx-3 mb-4 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            <span>Cluster</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              Healthy
            </span>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Node ID</p>
              <p className="font-medium text-foreground">node-01</p>
            </div>
            <div>
              <p className="text-muted-foreground">Replica Set</p>
              <p className="font-medium text-foreground">local-cluster</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

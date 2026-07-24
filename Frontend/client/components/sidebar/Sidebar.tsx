"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Database,
  LayoutDashboard,
  ChevronDown,
  Layers,
  Archive,
  ScrollText,
  BarChart3,
  FileText,
  Settings,
  KeyRound,
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
  const [storageOpen, setStorageOpen] = useState(true);

  const isActive = (href: string) => pathname === href;
  const storageActive = storageItems.some((i) => isActive(i.href));

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Database className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-wide">JOEX DB ENGINE</p>
          <p className="text-[11px] text-muted-foreground">
            LSM Storage Engine
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-2">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive("/dashboard")
              ? "bg-primary text-primary-foreground"
              : "text-foreground/80 hover:bg-secondary",
          )}
        >
          <LayoutDashboard className="size-4" />
          Dashboard
        </Link>

        <button
          type="button"
          onClick={() => setStorageOpen((v) => !v)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            storageActive
              ? "text-primary"
              : "text-foreground/80 hover:bg-secondary",
          )}
        >
          <span className="flex items-center gap-3">
            <Layers className="size-4" />
            Storage
          </span>
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              storageOpen ? "rotate-0" : "-rotate-90",
            )}
          />
        </button>

        {storageOpen && (
          <div className="ml-4 space-y-1 border-l border-border pl-4">
            {storageItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {item.label === "SSTables" && <Archive className="size-3.5" />}
                {item.label === "Write Ahead Log" && (
                  <FileText className="size-3.5" />
                )}
                {item.label === "MemTable" && <Database className="size-3.5" />}
                {item.label === "Data" && <KeyRound className="size-3.5" />}
                {item.label}
              </Link>
            ))}
          </div>
        )}

        <div className="my-2 border-t border-border" />

        <Link
          href="/logs"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive("/logs")
              ? "bg-primary text-primary-foreground"
              : "text-foreground/80 hover:bg-secondary",
          )}
        >
          <ScrollText className="size-4" />
          Logs
        </Link>

        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive("/settings")
              ? "bg-primary text-primary-foreground"
              : "text-foreground/80 hover:bg-secondary",
          )}
        >
          <Settings className="size-4" />
          Settings
        </Link>
      </nav>

      <div className="mx-3 mb-4 space-y-2 rounded-xl border border-border bg-card px-4 py-3 text-xs">
        <div>
          <p className="text-muted-foreground">Node ID</p>
          <p className="font-medium text-foreground">node-01</p>
        </div>
        <div>
          <p className="text-muted-foreground">Cluster</p>
          <p className="font-medium text-foreground">local-cluster</p>
        </div>
      </div>
    </aside>
  );
}

"use client";

import { useState } from "react";
import {
  Activity,
  FileText,
  Receipt,
  Camera,
  ClipboardList,
  MapPin,
  Share2,
  FileSignature,
} from "lucide-react";

export type WorkspaceTab =
  | "timeline"
  | "scope"
  | "invoices"
  | "photos"
  | "logs"
  | "checkin"
  | "waivers"
  | "share";

const ALL_TABS: { id: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
  { id: "timeline", label: "Timeline", icon: <Activity className="h-4 w-4" /> },
  { id: "scope", label: "Scope", icon: <FileText className="h-4 w-4" /> },
  { id: "invoices", label: "Invoices", icon: <Receipt className="h-4 w-4" /> },
  { id: "photos", label: "Photos", icon: <Camera className="h-4 w-4" /> },
  { id: "logs", label: "Daily Logs", icon: <ClipboardList className="h-4 w-4" /> },
  { id: "checkin", label: "Check-in", icon: <MapPin className="h-4 w-4" /> },
  { id: "waivers", label: "Waivers", icon: <FileSignature className="h-4 w-4" /> },
  { id: "share", label: "Share", icon: <Share2 className="h-4 w-4" /> },
];

export function WorkspaceTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: WorkspaceTab[];
  active: WorkspaceTab;
  onChange: (t: WorkspaceTab) => void;
}) {
  const visible = ALL_TABS.filter((t) => tabs.includes(t.id));
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-gray-200 pb-0">
      {visible.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            active === t.id
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function useWorkspaceTab(initial: WorkspaceTab = "timeline") {
  return useState<WorkspaceTab>(initial);
}

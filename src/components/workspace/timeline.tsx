import {
  Activity,
  MessageCircle,
  Camera,
  MapPin,
  Receipt,
  FileText,
  StickyNote,
  PenLine,
  GitBranch,
} from "lucide-react";
import type { BookingEvent, BookingEventType } from "@/types";
import { formatRelativeTime } from "@/lib/utils/format";

const ICON: Record<BookingEventType, React.ReactNode> = {
  stage_change: <GitBranch className="h-3.5 w-3.5" />,
  message: <MessageCircle className="h-3.5 w-3.5" />,
  photo: <Camera className="h-3.5 w-3.5" />,
  checkin: <MapPin className="h-3.5 w-3.5" />,
  invoice: <Receipt className="h-3.5 w-3.5" />,
  scope_change: <FileText className="h-3.5 w-3.5" />,
  note: <StickyNote className="h-3.5 w-3.5" />,
  signature: <PenLine className="h-3.5 w-3.5" />,
};

const COLOR: Record<BookingEventType, string> = {
  stage_change: "bg-emerald-100 text-emerald-700",
  message: "bg-blue-100 text-blue-700",
  photo: "bg-amber-100 text-amber-700",
  checkin: "bg-violet-100 text-violet-700",
  invoice: "bg-green-100 text-green-700",
  scope_change: "bg-orange-100 text-orange-700",
  note: "bg-gray-100 text-gray-700",
  signature: "bg-fuchsia-100 text-fuchsia-700",
};

export function Timeline({ events }: { events: BookingEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
        <Activity className="mx-auto h-8 w-8 text-gray-300" />
        <p className="mt-2 text-sm text-gray-500">
          No activity yet. Stage changes, messages, photos, and check-ins will show here.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-4 border-l-2 border-gray-100 pl-6">
      {events.map((e) => {
        const color = COLOR[e.event_type] ?? "bg-gray-100 text-gray-700";
        const icon = ICON[e.event_type] ?? <Activity className="h-3.5 w-3.5" />;
        return (
          <li key={e.id} className="relative">
            <span
              className={`absolute -left-[30px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white ${color}`}
            >
              {icon}
            </span>
            <div className="rounded-lg border border-gray-100 bg-white p-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-gray-900">{e.title}</p>
                <span className="shrink-0 text-xs text-gray-500">
                  {formatRelativeTime(e.created_at)}
                </span>
              </div>
              {e.body && (
                <p className="mt-1 text-sm text-gray-600">{e.body}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

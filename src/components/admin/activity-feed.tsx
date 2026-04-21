import Link from "next/link";
import {
  Activity,
  ClipboardList,
  UserPlus,
  Store,
  GitBranch,
} from "lucide-react";
import type { ActivityEntry } from "@/lib/queries/admin";
import { formatRelativeTime } from "@/lib/utils/format";

const KIND_ICON: Record<ActivityEntry["kind"], React.ReactNode> = {
  booking: <ClipboardList className="h-3.5 w-3.5" />,
  signup_client: <UserPlus className="h-3.5 w-3.5" />,
  signup_vendor: <Store className="h-3.5 w-3.5" />,
  event: <GitBranch className="h-3.5 w-3.5" />,
};

const KIND_COLOR: Record<ActivityEntry["kind"], string> = {
  booking: "bg-violet-100 text-violet-700",
  signup_client: "bg-blue-100 text-blue-700",
  signup_vendor: "bg-emerald-100 text-emerald-700",
  event: "bg-amber-100 text-amber-700",
};

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
        <Activity className="h-4 w-4 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Live activity</h2>
      </div>
      {entries.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-500">No activity yet.</p>
      ) : (
        <ol className="max-h-[520px] divide-y divide-gray-100 overflow-y-auto">
          {entries.map((e) => {
            const content = (
              <div className="flex items-start gap-3 px-6 py-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${KIND_COLOR[e.kind]}`}
                >
                  {KIND_ICON[e.kind]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {e.title}
                  </p>
                  <p className="truncate text-xs text-gray-500">{e.subtitle}</p>
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatRelativeTime(e.at)}
                </span>
              </div>
            );
            return (
              <li key={e.id}>
                {e.href ? (
                  <Link
                    href={e.href}
                    className="block transition-colors hover:bg-gray-50"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

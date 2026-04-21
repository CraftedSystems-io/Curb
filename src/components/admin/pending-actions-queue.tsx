import Link from "next/link";
import {
  ShieldAlert,
  Clock,
  AlertCircle,
  UserPlus,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import type { PendingAction } from "@/lib/queries/admin";
import { formatRelativeTime } from "@/lib/utils/format";

const KIND_CONFIG: Record<
  PendingAction["kind"],
  { icon: React.ReactNode; color: string }
> = {
  unverified_vendor: {
    icon: <ShieldAlert className="h-4 w-4" />,
    color: "bg-amber-100 text-amber-700",
  },
  stuck_pending: {
    icon: <Clock className="h-4 w-4" />,
    color: "bg-orange-100 text-orange-700",
  },
  past_due_subscription: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: "bg-red-100 text-red-700",
  },
  new_signup: {
    icon: <UserPlus className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-700",
  },
};

export function PendingActionsQueue({ actions }: { actions: PendingAction[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Needs your attention
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {actions.length} open {actions.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>
      {actions.length === 0 ? (
        <div className="p-10 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
          <p className="mt-3 font-medium text-gray-900">All clear</p>
          <p className="mt-1 text-sm text-gray-500">
            No pending verifications, stuck bookings, or past-due subscriptions.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {actions.map((a) => {
            const cfg = KIND_CONFIG[a.kind];
            return (
              <li key={a.id}>
                <Link
                  href={a.href}
                  className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-gray-50"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.color}`}
                  >
                    {cfg.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {a.title}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {a.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatRelativeTime(a.createdAt)}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

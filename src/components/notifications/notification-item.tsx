"use client";

import { clsx } from "clsx";
import {
  ClipboardList,
  MessageCircle,
  Star,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { NotificationType } from "@/types";

const typeConfig: Record<
  NotificationType,
  { icon: LucideIcon; color: string; bg: string }
> = {
  booking_update: {
    icon: ClipboardList,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  new_message: {
    icon: MessageCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  new_review: {
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  new_booking: {
    icon: Calendar,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
};

interface NotificationItemProps {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
  onClick: () => void;
}

export function NotificationItem({
  type,
  title,
  body,
  isRead,
  createdAt,
  onClick,
}: NotificationItemProps) {
  const config = typeConfig[type] ?? typeConfig.booking_update;
  const Icon = config.icon;

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
  });

  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
        "hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none",
        !isRead && "bg-emerald-50/40"
      )}
    >
      {/* Icon */}
      <div
        className={clsx(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          config.bg
        )}
      >
        <Icon className={clsx("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={clsx(
              "truncate text-sm",
              isRead ? "font-normal text-gray-700" : "font-semibold text-gray-900"
            )}
          >
            {title}
          </p>

          {/* Unread dot */}
          {!isRead && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          )}
        </div>

        {body && (
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{body}</p>
        )}

        <p className="mt-1 text-[11px] text-gray-400">{timeAgo}</p>
      </div>
    </button>
  );
}

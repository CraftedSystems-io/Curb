import { clsx } from "clsx";
import type { BookingStatus } from "@/types";
import { BOOKING_STATUS_CONFIG } from "@/lib/utils/constants";

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = BOOKING_STATUS_CONFIG[status];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}

import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils/format";
import type { BookingStatus } from "@/types";

interface BookingCardProps {
  booking: {
    id: string;
    status: BookingStatus;
    scheduled_date: string;
    scheduled_time: string | null;
    address: string;
    quoted_price: number | null;
    services: { name: string };
  };
  otherParty: {
    name: string;
    avatar_url: string | null;
  };
  href: string;
}

export function BookingCard({ booking, otherParty, href }: BookingCardProps) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer transition-all hover:shadow-md">
        <div className="flex items-start gap-4 p-4">
          <Avatar
            src={otherParty.avatar_url}
            name={otherParty.name}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 truncate">
                  {booking.services.name}
                </h3>
                <p className="text-sm text-gray-600">{otherParty.name}</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(booking.scheduled_date)}
                {booking.scheduled_time &&
                  ` at ${formatTime(booking.scheduled_time)}`}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                <span className="truncate max-w-[150px]">
                  {booking.address}
                </span>
              </span>
            </div>
            {booking.quoted_price && (
              <p className="mt-1 text-sm font-medium text-emerald-600">
                {formatCurrency(booking.quoted_price)}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

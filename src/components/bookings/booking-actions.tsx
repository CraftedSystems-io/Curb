"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateBookingStatus } from "@/lib/actions/bookings";
import type { BookingStatus } from "@/types";

interface BookingActionsProps {
  bookingId: string;
  currentStatus: BookingStatus;
  role: "client" | "contractor";
}

export function BookingActions({
  bookingId,
  currentStatus,
  role,
}: BookingActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleAction(newStatus: string) {
    setLoading(true);
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Booking ${newStatus}!`);
    }
    setLoading(false);
  }

  if (role === "contractor") {
    return (
      <div className="flex flex-wrap gap-2">
        {currentStatus === "pending" && (
          <>
            <Button
              onClick={() => handleAction("accepted")}
              loading={loading}
            >
              Accept
            </Button>
            <Button
              variant="danger"
              onClick={() => handleAction("declined")}
              loading={loading}
            >
              Decline
            </Button>
          </>
        )}
        {currentStatus === "accepted" && (
          <Button
            onClick={() => handleAction("in_progress")}
            loading={loading}
          >
            Start Job
          </Button>
        )}
        {currentStatus === "in_progress" && (
          <Button
            onClick={() => handleAction("completed")}
            loading={loading}
          >
            Mark Complete
          </Button>
        )}
      </div>
    );
  }

  // Client actions
  return (
    <div className="flex flex-wrap gap-2">
      {currentStatus === "pending" && (
        <Button
          variant="danger"
          onClick={() => handleAction("cancelled")}
          loading={loading}
        >
          Cancel Request
        </Button>
      )}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/types";

export function useRealtimeBooking(
  userId: string,
  role: "client" | "contractor",
  onUpdate: (booking: Booking) => void
) {
  useEffect(() => {
    const supabase = createClient();

    const filter =
      role === "client"
        ? `client_id=eq.${userId}`
        : `contractor_id=eq.${userId}`;

    const channel = supabase
      .channel("booking-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter,
        },
        (payload) => {
          onUpdate(payload.new as Booking);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, role, onUpdate]);
}

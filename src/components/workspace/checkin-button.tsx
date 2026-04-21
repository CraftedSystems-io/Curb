"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, LogIn, LogOut, Coffee } from "lucide-react";
import { toast } from "sonner";
import type { BookingCheckin } from "@/types";
import { formatRelativeTime } from "@/lib/utils/format";

export function CheckInButton({
  bookingId,
  checkins,
  editable,
}: {
  bookingId: string;
  checkins: BookingCheckin[];
  editable: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const last = checkins[0];
  const onSite = last?.kind === "arrival";

  async function punch(kind: "arrival" | "departure" | "break") {
    setBusy(kind);
    if (!navigator.geolocation) {
      setBusy(null);
      return toast.error("Location not available on this device");
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const res = await fetch(`/api/bookings/${bookingId}/checkin`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy_m: Math.round(pos.coords.accuracy),
          }),
        });
        setBusy(null);
        if (!res.ok) {
          const msg = (await res.json()).error ?? "Could not check in";
          return toast.error(msg);
        }
        toast.success(
          kind === "arrival"
            ? "Checked in"
            : kind === "departure"
              ? "Checked out"
              : "Break logged"
        );
        startTransition(() => router.refresh());
      },
      (err) => {
        setBusy(null);
        toast.error(`Location blocked: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  return (
    <div className="space-y-4">
      {editable && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Quick punch
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => punch("arrival")}
              disabled={busy !== null || onSite}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              {busy === "arrival" ? "Locating…" : "I've arrived"}
            </button>
            <button
              onClick={() => punch("break")}
              disabled={busy !== null || !onSite}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Coffee className="h-4 w-4" />
              {busy === "break" ? "Logging…" : "Break"}
            </button>
            <button
              onClick={() => punch("departure")}
              disabled={busy !== null || !onSite}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {busy === "departure" ? "Saving…" : "Leaving"}
            </button>
          </div>
          {onSite && (
            <p className="mt-3 text-xs text-emerald-700">
              You&apos;re checked in. Homeowner sees live status on their side.
            </p>
          )}
        </div>
      )}

      {checkins.length === 0 ? (
        <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
          No check-ins yet.
        </p>
      ) : (
        <div className="space-y-2">
          {checkins.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                <MapPin className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {c.kind === "arrival"
                    ? "Arrived"
                    : c.kind === "departure"
                      ? "Left"
                      : "Break"}
                </p>
                <p className="text-xs text-gray-500">
                  {formatRelativeTime(c.created_at)}
                  {c.distance_from_job_m !== null && (
                    <>
                      {" · "}
                      {c.distance_from_job_m}m from site
                      {c.is_within_geofence ? " (on site)" : " (outside geofence)"}
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { BOOKING_STAGE_CONFIG, STAGE_NEXT } from "@/lib/utils/constants";
import type { BookingStage } from "@/types";

export function StageControl({
  bookingId,
  currentStage,
  role,
}: {
  bookingId: string;
  currentStage: BookingStage | null;
  role: "client" | "contractor";
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<BookingStage | null>(null);

  const s = (currentStage ?? "inquiry") as BookingStage;
  const nextOptions = STAGE_NEXT[s] ?? [];

  if (nextOptions.length === 0) return null;

  async function advance(to: BookingStage) {
    setBusy(to);
    const res = await fetch(`/api/bookings/${bookingId}/stage`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stage: to }),
    });
    setBusy(null);
    if (!res.ok) {
      const msg = (await res.json()).error ?? "Could not update stage";
      return toast.error(msg);
    }
    toast.success(`Moved to ${BOOKING_STAGE_CONFIG[to].label}`);
    startTransition(() => router.refresh());
  }

  // Only show forward options for contractor; client sees acceptance-only options
  const allowed = nextOptions.filter((n) => {
    if (role === "client") {
      return ["accepted", "cancelled"].includes(n) || (s === "quoted" && n === "accepted");
    }
    return true;
  });

  if (allowed.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Next step
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {allowed.map((n) => {
          const cfg = BOOKING_STAGE_CONFIG[n];
          const destructive = n === "cancelled" || n === "declined";
          return (
            <button
              key={n}
              onClick={() => advance(n)}
              disabled={busy !== null}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                destructive
                  ? "border border-red-200 bg-white text-red-700 hover:bg-red-50"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {destructive ? <X className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              {busy === n ? "Saving…" : `Move to ${cfg.label}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}

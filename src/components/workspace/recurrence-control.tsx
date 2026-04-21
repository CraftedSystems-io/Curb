"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Repeat, Check } from "lucide-react";
import { toast } from "sonner";

const PRESETS: { label: string; rule: string | null; hint: string }[] = [
  { label: "One-time", rule: null, hint: "No recurrence" },
  { label: "Weekly", rule: "FREQ=WEEKLY;INTERVAL=1", hint: "Every week" },
  { label: "Biweekly", rule: "FREQ=WEEKLY;INTERVAL=2", hint: "Every 2 weeks" },
  { label: "Monthly", rule: "FREQ=MONTHLY;INTERVAL=1", hint: "Every month" },
];

export function RecurrenceControl({
  bookingId,
  currentRule,
  editable,
}: {
  bookingId: string;
  currentRule: string | null;
  editable: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  async function set(rule: string | null) {
    setSaving(true);
    const res = await fetch(`/api/bookings/${bookingId}/recurrence`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recurrence_rule: rule }),
    });
    setSaving(false);
    if (!res.ok) return toast.error("Could not save");
    toast.success(rule ? "Recurrence set" : "Recurrence removed");
    startTransition(() => router.refresh());
  }

  const activeLabel =
    PRESETS.find((p) => p.rule === currentRule)?.label ??
    (currentRule ? "Custom" : "One-time");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <Repeat className="h-4 w-4" />
        Recurrence
        <span className="ml-auto text-xs text-gray-400 normal-case tracking-normal">
          {currentRule
            ? "A new booking auto-creates when this one completes."
            : "This is a one-time job."}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = (currentRule ?? null) === p.rule;
          return (
            <button
              key={p.label}
              onClick={() => editable && set(p.rule)}
              disabled={!editable || saving}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                active
                  ? "bg-emerald-600 text-white"
                  : editable
                    ? "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    : "bg-gray-100 text-gray-500"
              }`}
              title={p.hint}
            >
              {active && <Check className="h-3.5 w-3.5" />}
              {p.label}
            </button>
          );
        })}
      </div>
      {!editable && (
        <p className="mt-3 text-xs text-gray-500">
          Current cadence: <span className="font-medium">{activeLabel}</span>
        </p>
      )}
    </div>
  );
}

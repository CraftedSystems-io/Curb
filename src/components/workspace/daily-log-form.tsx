"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CloudSun, Users, Clock, Gauge, StickyNote } from "lucide-react";
import { toast } from "sonner";
import type { DailyLog } from "@/types";
import { formatDate } from "@/lib/utils/format";

export function DailyLogForm({
  bookingId,
  logs,
  editable,
}: {
  bookingId: string;
  logs: DailyLog[];
  editable: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const today = new Date().toISOString().split("T")[0];
  const existing = logs.find((l) => l.log_date === today);

  const [draft, setDraft] = useState({
    hours_worked: existing?.hours_worked ?? 0,
    crew_count: existing?.crew_count ?? 1,
    weather: existing?.weather ?? "",
    percent_complete: existing?.percent_complete ?? 0,
    notes: existing?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/bookings/${bookingId}/logs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...draft, log_date: today }),
    });
    setSaving(false);
    if (!res.ok) return toast.error("Could not save log");
    toast.success("Log saved");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      {editable && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Today&apos;s log — {formatDate(today)}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Hours worked"
              icon={<Clock className="h-4 w-4" />}
              value={
                <input
                  type="number"
                  step="0.25"
                  value={draft.hours_worked}
                  onChange={(e) =>
                    setDraft({ ...draft, hours_worked: Number(e.target.value) })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              }
            />
            <Field
              label="Crew count"
              icon={<Users className="h-4 w-4" />}
              value={
                <input
                  type="number"
                  min={0}
                  value={draft.crew_count}
                  onChange={(e) =>
                    setDraft({ ...draft, crew_count: Number(e.target.value) })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              }
            />
            <Field
              label="Weather"
              icon={<CloudSun className="h-4 w-4" />}
              value={
                <input
                  value={draft.weather}
                  onChange={(e) =>
                    setDraft({ ...draft, weather: e.target.value })
                  }
                  placeholder="Sunny, 75°F"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              }
            />
            <Field
              label="Percent complete"
              icon={<Gauge className="h-4 w-4" />}
              value={
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={draft.percent_complete}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        percent_complete: Number(e.target.value),
                      })
                    }
                    className="flex-1"
                  />
                  <span className="w-10 text-right text-sm font-medium tabular-nums">
                    {draft.percent_complete}%
                  </span>
                </div>
              }
            />
          </div>
          <Field
            label="Notes"
            icon={<StickyNote className="h-4 w-4" />}
            value={
              <textarea
                rows={3}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="What happened today?"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            }
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : existing ? "Update today's log" : "Save log"}
            </button>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
          No daily logs yet.
        </p>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <div
              key={l.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-4">
                <p className="font-medium text-gray-900">
                  {formatDate(l.log_date)}
                </p>
                {l.percent_complete != null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    <Gauge className="h-3 w-3" /> {l.percent_complete}%
                  </span>
                )}
                {l.hours_worked != null && (
                  <span className="text-xs text-gray-500">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {Number(l.hours_worked)}h
                  </span>
                )}
                {l.crew_count != null && (
                  <span className="text-xs text-gray-500">
                    <Users className="mr-1 inline h-3 w-3" />
                    {l.crew_count} crew
                  </span>
                )}
                {l.weather && (
                  <span className="text-xs text-gray-500">
                    <CloudSun className="mr-1 inline h-3 w-3" />
                    {l.weather}
                  </span>
                )}
              </div>
              {l.notes && (
                <p className="mt-2 text-sm text-gray-600">{l.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  icon,
  value,
}: {
  label: string;
  icon: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
        {icon}
        {label}
      </label>
      <div className="mt-1">{value}</div>
    </div>
  );
}

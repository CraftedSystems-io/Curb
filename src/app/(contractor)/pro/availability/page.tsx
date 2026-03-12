"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { updateAvailability } from "@/lib/actions/availability";
import { DAYS_OF_WEEK } from "@/lib/utils/constants";

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export default function ContractorAvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contractorId, setContractorId] = useState("");
  const [slots, setSlots] = useState<AvailabilitySlot[]>(
    DAYS_OF_WEEK.map((_, i) => ({
      day_of_week: i,
      start_time: "08:00",
      end_time: "17:00",
      is_available: i >= 1 && i <= 5, // Mon-Fri
    }))
  );

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: contractor } = await supabase
        .from("contractors")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (!contractor) return;
      setContractorId(contractor.id);

      const { data: existing } = await supabase
        .from("availability")
        .select("*")
        .eq("contractor_id", contractor.id)
        .order("day_of_week");

      if (existing && existing.length > 0) {
        setSlots((prev) =>
          prev.map((slot) => {
            const match = existing.find(
              (e) => e.day_of_week === slot.day_of_week
            );
            return match
              ? {
                  day_of_week: match.day_of_week,
                  start_time: match.start_time,
                  end_time: match.end_time,
                  is_available: match.is_available,
                }
              : slot;
          })
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    const result = await updateAvailability(contractorId, slots);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Availability updated!");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="h-64 rounded-xl bg-gray-200" />
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
        <Button onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Weekly Schedule</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {slots.map((slot, idx) => (
            <div
              key={slot.day_of_week}
              className={`flex items-center gap-4 rounded-lg border p-4 ${
                slot.is_available ? "border-emerald-200 bg-emerald-50" : "border-gray-200"
              }`}
            >
              <label className="flex w-28 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={slot.is_available}
                  onChange={(e) => {
                    const updated = [...slots];
                    updated[idx] = {
                      ...slot,
                      is_available: e.target.checked,
                    };
                    setSlots(updated);
                  }}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-900">
                  {DAYS_OF_WEEK[slot.day_of_week]}
                </span>
              </label>

              {slot.is_available && (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    value={slot.start_time}
                    onChange={(e) => {
                      const updated = [...slots];
                      updated[idx] = {
                        ...slot,
                        start_time: e.target.value,
                      };
                      setSlots(updated);
                    }}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={slot.end_time}
                    onChange={(e) => {
                      const updated = [...slots];
                      updated[idx] = {
                        ...slot,
                        end_time: e.target.value,
                      };
                      setSlots(updated);
                    }}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {!slot.is_available && (
                <span className="text-sm text-gray-400">Unavailable</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

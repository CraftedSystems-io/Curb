"use client";

import { Check } from "lucide-react";
import { BOOKING_STAGE_CONFIG } from "@/lib/utils/constants";
import type { BookingStage } from "@/types";

const PIPELINE_ORDER: BookingStage[] = [
  "inquiry",
  "quoted",
  "accepted",
  "deposit_paid",
  "scheduled",
  "on_site",
  "punch_list",
  "completed",
];

export function StagePipeline({ stage }: { stage: BookingStage | null }) {
  const current = stage && PIPELINE_ORDER.indexOf(stage) >= 0 ? stage : "inquiry";
  const isCancelled = stage === "cancelled" || stage === "declined";
  const currentStep = BOOKING_STAGE_CONFIG[current].step;

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-900">
          {BOOKING_STAGE_CONFIG[stage as BookingStage].label}
        </p>
        <p className="mt-1 text-xs text-red-700">
          {BOOKING_STAGE_CONFIG[stage as BookingStage].description}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Project Pipeline
      </p>
      <div className="mt-4 flex items-start">
        {PIPELINE_ORDER.map((s, idx) => {
          const config = BOOKING_STAGE_CONFIG[s];
          const isDone = config.step < currentStep;
          const isCurrent = s === current;
          const isNext = config.step === currentStep + 1;
          return (
            <div
              key={s}
              className="flex flex-1 flex-col items-center"
            >
              <div className="flex w-full items-center">
                {idx > 0 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      isDone || isCurrent ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                )}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                        : isNext
                          ? "border-2 border-emerald-300 bg-white text-emerald-700"
                          : "border-2 border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : config.step}
                </div>
                {idx < PIPELINE_ORDER.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      isDone ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              <p
                className={`mt-2 text-center text-xs font-medium ${
                  isCurrent
                    ? "text-emerald-700"
                    : isDone
                      ? "text-gray-900"
                      : "text-gray-400"
                }`}
              >
                {config.label}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-gray-600">
        <span className="font-medium text-gray-900">
          {BOOKING_STAGE_CONFIG[current].label}:
        </span>{" "}
        {BOOKING_STAGE_CONFIG[current].description}
      </p>
    </div>
  );
}

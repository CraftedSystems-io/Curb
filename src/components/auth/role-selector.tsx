"use client";

import { Search, Wrench } from "lucide-react";
import { clsx } from "clsx";

interface RoleSelectorProps {
  value: string;
  onChange: (role: string) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        I want to...
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("client")}
          className={clsx(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
            value === "client"
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-200 hover:border-gray-300"
          )}
        >
          <Search
            size={24}
            className={
              value === "client" ? "text-emerald-600" : "text-gray-400"
            }
          />
          <span
            className={clsx(
              "text-sm font-medium",
              value === "client" ? "text-emerald-700" : "text-gray-600"
            )}
          >
            Find a Pro
          </span>
        </button>
        <button
          type="button"
          onClick={() => onChange("contractor")}
          className={clsx(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
            value === "contractor"
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-200 hover:border-gray-300"
          )}
        >
          <Wrench
            size={24}
            className={
              value === "contractor"
                ? "text-emerald-600"
                : "text-gray-400"
            }
          />
          <span
            className={clsx(
              "text-sm font-medium",
              value === "contractor"
                ? "text-emerald-700"
                : "text-gray-600"
            )}
          >
            Offer Services
          </span>
        </button>
      </div>
    </div>
  );
}

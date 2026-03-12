"use client";

import { Waves, TreePine, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import type { ServiceCategory } from "@/types";

const filters: {
  value: ServiceCategory | "all";
  label: string;
  icon: typeof Waves;
  activeClass: string;
}[] = [
  {
    value: "all",
    label: "All",
    icon: Sparkles,
    activeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    value: "pool",
    label: "Pool",
    icon: Waves,
    activeClass: "bg-blue-100 text-blue-800 border-blue-300",
  },
  {
    value: "landscaping",
    label: "Landscaping",
    icon: TreePine,
    activeClass: "bg-green-100 text-green-800 border-green-300",
  },
  {
    value: "maid",
    label: "Maid",
    icon: Sparkles,
    activeClass: "bg-purple-100 text-purple-800 border-purple-300",
  },
];

interface ServiceFilterProps {
  value: ServiceCategory | "all";
  onChange: (value: ServiceCategory | "all") => void;
}

export function ServiceFilter({ value, onChange }: ServiceFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = value === filter.value;

        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
              isActive
                ? filter.activeClass
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            )}
          >
            <Icon size={14} />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

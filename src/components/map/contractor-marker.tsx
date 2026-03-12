"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Waves, TreePine, Sparkles } from "lucide-react";
import type { NearbyContractor, ServiceCategory } from "@/types";

const categoryIcons: Record<ServiceCategory, typeof Waves> = {
  pool: Waves,
  landscaping: TreePine,
  maid: Sparkles,
};

const categoryColors: Record<ServiceCategory, string> = {
  pool: "bg-blue-500",
  landscaping: "bg-green-500",
  maid: "bg-purple-500",
};

interface ContractorMarkerProps {
  contractor: NearbyContractor;
  isSelected: boolean;
  onClick: () => void;
}

export function ContractorMarker({
  contractor,
  isSelected,
  onClick,
}: ContractorMarkerProps) {
  const primaryCategory = contractor.services?.[0]?.category || "pool";
  const Icon = categoryIcons[primaryCategory];
  const bgColor = categoryColors[primaryCategory];

  return (
    <AdvancedMarker
      position={{ lat: contractor.base_lat, lng: contractor.base_lng }}
      onClick={onClick}
    >
      <div
        className={`flex items-center gap-1 rounded-full px-2 py-1 shadow-lg transition-transform ${
          isSelected ? "scale-125 ring-2 ring-white" : ""
        } ${bgColor}`}
      >
        <Icon className="h-4 w-4 text-white" />
        <span className="text-xs font-semibold text-white">
          {contractor.rating_avg > 0
            ? contractor.rating_avg.toFixed(1)
            : "New"}
        </span>
      </div>
      {/* Arrow pointing down */}
      <div
        className={`mx-auto h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent ${
          primaryCategory === "pool"
            ? "border-t-blue-500"
            : primaryCategory === "landscaping"
              ? "border-t-green-500"
              : "border-t-purple-500"
        }`}
      />
    </AdvancedMarker>
  );
}

"use client";

import { ContractorCard } from "./contractor-card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, SearchX } from "lucide-react";
import type { NearbyContractor } from "@/types";

type SortOption = "distance" | "rating" | "price_low" | "price_high" | "reviews";

interface ContractorListProps {
  contractors: NearbyContractor[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  loading?: boolean;
  favoriteIds?: Set<string>;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

function sortContractors(
  contractors: NearbyContractor[],
  sortBy: SortOption
): NearbyContractor[] {
  const sorted = [...contractors];
  switch (sortBy) {
    case "distance":
      return sorted.sort((a, b) => a.distance_m - b.distance_m);
    case "rating":
      return sorted.sort((a, b) => b.rating_avg - a.rating_avg);
    case "price_low":
      return sorted.sort(
        (a, b) => (a.hourly_rate || 999) - (b.hourly_rate || 999)
      );
    case "price_high":
      return sorted.sort(
        (a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0)
      );
    case "reviews":
      return sorted.sort((a, b) => b.review_count - a.review_count);
    default:
      return sorted;
  }
}

export function ContractorList({
  contractors,
  selectedId,
  onSelect,
  loading,
  favoriteIds,
  sortBy = "distance",
  onSortChange,
}: ContractorListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (contractors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <SearchX size={28} className="text-gray-400" />
        </div>
        <p className="mt-4 text-lg font-medium text-gray-900">
          No pros found nearby
        </p>
        <p className="mt-1 max-w-xs text-sm text-gray-500">
          Try searching a different location, expanding your search area, or
          changing the service category.
        </p>
      </div>
    );
  }

  const sorted = sortContractors(contractors, sortBy);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin size={12} />
          {contractors.length} pro{contractors.length !== 1 ? "s" : ""} found
        </p>
        {onSortChange && (
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="distance">Nearest</option>
            <option value="rating">Top Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        )}
      </div>
      {sorted.map((contractor) => (
        <ContractorCard
          key={contractor.id}
          contractor={contractor}
          isSelected={selectedId === contractor.id}
          onHover={() => onSelect?.(contractor.id)}
          onLeave={() => onSelect?.(null as unknown as string)}
          showFavorite={!!favoriteIds}
          isFavorited={favoriteIds?.has(contractor.id) || false}
        />
      ))}
    </div>
  );
}

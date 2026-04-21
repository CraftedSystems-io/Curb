"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Card } from "@/components/ui/card";
import { TierBadge } from "@/components/ui/tier-badge";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { formatDistance, formatCurrency } from "@/lib/utils/format";
import { clsx } from "clsx";
import type { NearbyContractor, ServiceCategory } from "@/types";

interface ContractorCardProps {
  contractor: NearbyContractor;
  isSelected?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  showFavorite?: boolean;
  isFavorited?: boolean;
}

export function ContractorCard({
  contractor,
  isSelected,
  onHover,
  onLeave,
  showFavorite = false,
  isFavorited = false,
}: ContractorCardProps) {
  return (
    <Link href={`/contractor/${contractor.id}`}>
      <Card
        className={clsx(
          "cursor-pointer transition-all hover:shadow-md",
          isSelected && "ring-2 ring-emerald-500"
        )}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        <div className="relative flex gap-4 p-4">
          <Avatar
            src={contractor.avatar_url}
            name={contractor.full_name}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 pr-8">
              <h3 className="font-semibold text-gray-900 truncate">
                {contractor.business_name || contractor.full_name}
              </h3>
              {contractor.tier && <TierBadge tier={contractor.tier} size="xs" />}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <StarRating rating={contractor.rating_avg} size={14} />
              <span className="text-xs text-gray-500">
                ({contractor.review_count})
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} />
              {formatDistance(contractor.distance_m)} away
            </div>
            {contractor.services && contractor.services.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {contractor.services.slice(0, 3).map((svc) => (
                  <Badge
                    key={svc.id}
                    variant={svc.category as ServiceCategory}
                  >
                    {svc.name}
                  </Badge>
                ))}
              </div>
            )}
            {contractor.hourly_rate && (
              <p className="mt-2 text-sm font-medium text-emerald-600">
                From {formatCurrency(contractor.hourly_rate)}/hr
              </p>
            )}
          </div>
          {showFavorite && (
            <div className="absolute right-3 top-3">
              <FavoriteButton
                contractorId={contractor.id}
                initialFavorited={isFavorited}
                variant="floating"
                size="sm"
              />
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
